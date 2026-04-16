import type {
  BOOKING_STATUSES,
  DOCK_TYPES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
} from "./constants";

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type DockType = (typeof DOCK_TYPES)[number];
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  notify_new_bookings: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  owner_id: string;
  name: string;
  address_street: string | null;
  address_city: string | null;
  address_zip: string | null;
  address_country: string;
  opening_time: string;
  closing_time: string;
  timezone: string;
  booking_token: string;
  default_slot_duration_minutes: number;
  max_advance_booking_days: number;
  created_at: string;
  updated_at: string;
}

export interface Dock {
  id: string;
  warehouse_id: string;
  name: string;
  dock_type: DockType;
  max_concurrent: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DockSchedule {
  id: string;
  dock_id: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  slot_duration_minutes: number | null;
  is_closed: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  warehouse_id: string;
  dock_id: string;
  slot_start: string;
  slot_end: string;
  status: BookingStatus;
  carrier_company: string;
  carrier_contact_name: string | null;
  carrier_email: string | null;
  carrier_phone: string | null;
  license_plate: string | null;
  reference_number: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  confirmation_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
