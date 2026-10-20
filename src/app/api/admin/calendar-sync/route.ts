import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getCalendarSyncSettings,
  saveCalendarFeedUrl,
  syncCalendarFeed,
} from "@/lib/db/services/calendarSyncService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await getCalendarSyncSettings() });
  } catch (error) {
    console.error("Failed to load calendar sync settings:", error);
    return NextResponse.json({ error: "Failed to load calendar sync settings." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.feedUrl !== "string") {
      return NextResponse.json({ error: "A calendar feed URL is required." }, { status: 400 });
    }

    await saveCalendarFeedUrl(body.feedUrl);
    const data = body.feedUrl.trim()
      ? await syncCalendarFeed({ force: true })
      : await getCalendarSyncSettings();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save the calendar feed.";
    const data = await getCalendarSyncSettings().catch(() => undefined);
    return NextResponse.json({ error: message, data }, { status: 502 });
  }
}

export async function POST() {
  try {
    const data = await syncCalendarFeed({ force: true });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar sync failed.";
    const data = await getCalendarSyncSettings().catch(() => undefined);
    return NextResponse.json({ error: message, data }, { status: 502 });
  }
}