export const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120] as const;

export const BOOKING_STATUSES = [
  "confirmed",
  "arrived",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const DOCK_TYPES = ["general", "inbound", "outbound"] as const;

export const MAX_ADVANCE_DAYS = 14;

export const MAX_CONCURRENT_MIN = 1;
export const MAX_CONCURRENT_MAX = 5;

export const DEFAULT_OPENING_TIME = "07:00";
export const DEFAULT_CLOSING_TIME = "17:00";
export const DEFAULT_SLOT_DURATION = 45;
export const DEFAULT_TIMEZONE = "Europe/Berlin";

export const SUBSCRIPTION_PLANS = [
  "free",
  "starter",
  "professional",
  "business",
] as const;

export const SUBSCRIPTION_STATUSES = [
  "trial",
  "active",
  "cancelled",
  "past_due",
] as const;
