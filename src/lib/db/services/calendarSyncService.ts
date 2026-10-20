import { createHash, randomUUID } from "node:crypto";
import ical, { type DateWithTimeZone, type VEvent } from "node-ical";
import { getDatabase } from "../mongodb";

const SETTINGS_ID = "vrbo";
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
const RETRY_INTERVAL_MS = 5 * 60 * 1000;
const MAX_FEED_BYTES = 2 * 1024 * 1024;
const RECURRENCE_WINDOW_YEARS = 3;

export interface CalendarSyncSettings {
  feedUrl: string;
  lastSyncedAt?: string;
  lastAttemptAt?: string;
  lastError?: string;
  importedEventCount?: number;
}

interface ImportedCalendarEvent {
  source: "vrbo";
  eventKey: string;
  startDate: string;
  endDate: string;
  importedAt: string;
  syncId: string;
}

function validateFeedUrl(feedUrl: string): string {
  let url: URL;
  try {
    url = new URL(feedUrl);
  } catch {
    throw new Error("Enter a valid VRBO iCalendar URL.");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    (hostname !== "vrbo.com" && !hostname.endsWith(".vrbo.com")) ||
    url.username ||
    url.password
  ) {
    throw new Error("The calendar URL must be an HTTPS link hosted by VRBO.");
  }

  return url.toString();
}

function dateKey(date: DateWithTimeZone): string {
  if (date.dateOnly) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Anguilla",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function subtractOneDay(date: DateWithTimeZone): DateWithTimeZone {
  const previousDay = new Date(date);
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  if (date.dateOnly) Object.assign(previousDay, { dateOnly: true });
  return previousDay as DateWithTimeZone;
}

function getEventRange(event: Pick<VEvent, "start" | "end">): {
  startDate: string;
  endDate: string;
} | null {
  if (!(event.start instanceof Date) || !(event.end instanceof Date)) return null;
  if (!Number.isFinite(event.start.getTime()) || !Number.isFinite(event.end.getTime())) return null;

  const startDate = dateKey(event.start);
  const exclusiveEndDate = dateKey(event.end);
  if (exclusiveEndDate <= startDate) return null;

  return { startDate, endDate: dateKey(subtractOneDay(event.end)) };
}

function getEventInstances(event: VEvent, now: Date): Array<Pick<VEvent, "start" | "end" | "status">> {
  if (event.status === "CANCELLED") return [];

  if (!event.rrule) return [event];

  const from = new Date(now);
  from.setUTCDate(1);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCFullYear(to.getUTCFullYear() + RECURRENCE_WINDOW_YEARS);

  return ical
    .expandRecurringEvent(event, { from, to, includeOverrides: true, excludeExdates: true, expandOngoing: true })
    .filter((instance) => instance.event.status !== "CANCELLED")
    .map((instance) => ({ start: instance.start, end: instance.end, status: instance.event.status }));
}

async function fetchFeed(feedUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(feedUrl, {
      headers: { Accept: "text/calendar, text/plain;q=0.9" },
      redirect: "error",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`VRBO calendar returned HTTP ${response.status}.`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_FEED_BYTES) throw new Error("The VRBO calendar feed is too large.");

    const body = await response.text();
    if (Buffer.byteLength(body, "utf8") > MAX_FEED_BYTES) {
      throw new Error("The VRBO calendar feed is too large.");
    }
    if (!body.includes("BEGIN:VCALENDAR")) throw new Error("The URL did not return a valid iCalendar feed.");
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeed(body: string, now: Date, syncId: string): ImportedCalendarEvent[] {
  const parsed = ical.sync.parseICS(body);
  const importedAt = now.toISOString();
  const events: ImportedCalendarEvent[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== "VEVENT") continue;
    const event = component as VEvent;
    const instances = getEventInstances(event, now);

    for (const instance of instances) {
      const range = getEventRange(instance);
      if (!range) continue;

      const identity = `${event.uid || "event"}:${instance.start?.toISOString() || range.startDate}`;
      events.push({
        source: "vrbo",
        eventKey: createHash("sha256").update(identity).digest("hex"),
        ...range,
        importedAt,
        syncId,
      });
    }
  }

  return events;
}

export async function getCalendarSyncSettings(): Promise<CalendarSyncSettings> {
  const db = await getDatabase();
  const settings = await db.collection<CalendarSyncSettings & { _id: string }>("calendar_sync_settings").findOne({
    _id: SETTINGS_ID,
  });

  return {
    feedUrl: settings?.feedUrl || "",
    lastSyncedAt: settings?.lastSyncedAt,
    lastAttemptAt: settings?.lastAttemptAt,
    lastError: settings?.lastError,
    importedEventCount: settings?.importedEventCount || 0,
  };
}

export async function saveCalendarFeedUrl(feedUrl: string): Promise<CalendarSyncSettings> {
  const normalizedUrl = feedUrl.trim() ? validateFeedUrl(feedUrl.trim()) : "";
  const db = await getDatabase();
  await db.collection<CalendarSyncSettings & { _id: string }>("calendar_sync_settings").updateOne(
    { _id: SETTINGS_ID },
    {
      $set: { feedUrl: normalizedUrl, lastError: "", updatedAt: new Date().toISOString() },
      $setOnInsert: { createdAt: new Date().toISOString() },
    },
    { upsert: true }
  );

  if (!normalizedUrl) {
    await db.collection("external_calendar_events").deleteMany({ source: "vrbo" });
  }

  return getCalendarSyncSettings();
}

export async function syncCalendarFeed(options: { force?: boolean } = {}): Promise<CalendarSyncSettings> {
  const db = await getDatabase();
  const settingsCollection = db.collection<CalendarSyncSettings & { _id: string }>("calendar_sync_settings");
  const current = await getCalendarSyncSettings();
  if (!current.feedUrl) return current;

  const now = new Date();
  const lastAttempt = current.lastAttemptAt ? new Date(current.lastAttemptAt).getTime() : 0;
  const minimumInterval = current.lastError ? RETRY_INTERVAL_MS : SYNC_INTERVAL_MS;
  if (!options.force && now.getTime() - lastAttempt < minimumInterval) return current;

  const attemptAt = now.toISOString();
  await settingsCollection.updateOne(
    { _id: SETTINGS_ID },
    { $set: { lastAttemptAt: attemptAt, lastError: "" } }
  );

  try {
    const feedUrl = validateFeedUrl(current.feedUrl);
    const body = await fetchFeed(feedUrl);
    const syncId = randomUUID();
    const events = parseFeed(body, now, syncId);
    const eventsCollection = db.collection<ImportedCalendarEvent>("external_calendar_events");

    if (events.length) await eventsCollection.insertMany(events, { ordered: true });
    await eventsCollection.deleteMany({ source: "vrbo", syncId: { $ne: syncId } });

    await settingsCollection.updateOne(
      { _id: SETTINGS_ID },
      {
        $set: {
          lastSyncedAt: now.toISOString(),
          lastAttemptAt: now.toISOString(),
          lastError: "",
          importedEventCount: events.length,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar sync failed.";
    await settingsCollection.updateOne({ _id: SETTINGS_ID }, { $set: { lastError: message } });
    throw error;
  }

  return getCalendarSyncSettings();
}

export async function refreshCalendarFeedIfStale(): Promise<void> {
  try {
    await syncCalendarFeed();
  } catch (error) {
    console.error("VRBO calendar refresh failed; serving the last successful import:", error);
  }
}