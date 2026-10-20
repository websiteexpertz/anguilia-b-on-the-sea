import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncCalendarFeed } from "@/lib/db/services/calendarSyncService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const expected = secret ? `Bearer ${secret}` : "";
  const actualBuffer = Buffer.from(authorization);
  const expectedBuffer = Buffer.from(expected);

  if (
    !secret ||
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: secret ? 401 : 503 });
  }

  try {
    const data = await syncCalendarFeed({ force: true });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Scheduled VRBO calendar sync failed:", error);
    return NextResponse.json({ error: "Calendar sync failed." }, { status: 502 });
  }
}