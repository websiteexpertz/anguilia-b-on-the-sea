export type ChargeType = "fixed" | "percentage" | "per_night" | "per_guest";

export interface BaseRateConfig {
  villaName: string;
  nightlyRate: number;
  minStay: number;
  currency: string;
  updatedAt: string;
}

export interface SeasonalRule {
  _id: string;
  name: string;
  startDate?: string; // YYYY-MM-DD or MM-DD
  endDate?: string; // YYYY-MM-DD or MM-DD
  from?: string; // e.g. "May 1"
  to?: string; // e.g. "Nov 14"
  dateRange?: string; // e.g. "May 1 – Nov 14"
  nightlyRate: number; // e.g. 1200
  perNight?: number; // alias for nightlyRate
  weekendNight?: number; // e.g. 1400
  weekly?: number; // e.g. 7500
  monthly?: number | null; // e.g. 22000 or null
  minStay: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalCharge {
  _id: string;
  name: string;
  amount: number;
  type: ChargeType;
  appliedTo?: string; // e.g. "Applied to total rental"
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NightRateBreakdown {
  date: string;
  rate: number;
  seasonName?: string;
}

export interface ChargeBreakdown {
  id: string;
  name: string;
  type: ChargeType;
  rateValue: number;
  calculatedAmount: number;
}

export interface PricingCalculationResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  nightlyBreakdown: NightRateBreakdown[];
  subtotal: number;
  averageNightlyRate: number;
  chargesBreakdown: ChargeBreakdown[];
  totalCharges: number;
  grandTotal: number;
}

export interface CreateSeasonDto {
  name: string;
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
  dateRange?: string;
  nightlyRate: number;
  perNight?: number;
  weekendNight?: number;
  weekly?: number;
  monthly?: number | null;
  minStay?: number;
  description?: string;
  isActive?: boolean;
}

export interface CreateChargeDto {
  name: string;
  amount: number;
  type: ChargeType;
  appliedTo?: string;
  description?: string;
  isActive?: boolean;
}
