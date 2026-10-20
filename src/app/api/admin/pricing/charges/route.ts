import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdditionalCharge, listAdditionalCharges } from "@/lib/db/services/pricingService";
import { ChargeType } from "@/lib/types/pricing";

export async function GET() {
  try {
    const charges = await listAdditionalCharges();
    return NextResponse.json({
      success: true,
      charges,
      data: charges,
    });
  } catch (error: any) {
    console.error("Error fetching charges:", error);
    return NextResponse.json(
      { error: "Failed to load charges." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { name, amount, type, description, isActive } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Charge name is required." },
        { status: 400 }
      );
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return NextResponse.json(
        { error: "Charge amount must be 0 or greater." },
        { status: 400 }
      );
    }

    const validTypes: ChargeType[] = ["fixed", "percentage", "per_night", "per_guest"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Valid charge type (fixed, percentage, per_night, per_guest) is required." },
        { status: 400 }
      );
    }

    const charge = await createAdditionalCharge({
      name,
      amount: Number(amount),
      type,
      description,
      isActive: isActive !== false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Additional charge created successfully.",
        charge,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating additional charge:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create additional charge." },
      { status: 400 }
    );
  }
}
