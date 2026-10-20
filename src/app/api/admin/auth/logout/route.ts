import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear session cookie
  response.cookies.set({
    name: AUTH_CONFIG.cookieName,
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
