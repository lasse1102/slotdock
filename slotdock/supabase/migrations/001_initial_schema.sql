-- SlotDock Initial Schema
-- Tables: profiles, warehouses, docks, dock_schedules, bookings, subscriptions

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address_street VARCHAR(255),
  address_city VARCHAR(255),
  address_zip VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'Deutschland',
  opening_time TIME NOT NULL DEFAULT '07:00',
  closing_time TIME NOT NULL DEFAULT '17:00',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin',
  booking_token UUID NOT NULL DEFAULT gen_random_uuid(),
  default_slot_duration_minutes INTEGER NOT NULL DEFAULT 45,
  max_advance_booking_days INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_warehouses_owner_id ON warehouses(owner_id);
CREATE UNIQUE INDEX idx_warehouses_booking_token ON warehouses(booking_token);

-- Docks
CREATE TABLE docks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  dock_type VARCHAR(50) NOT NULL DEFAULT 'general',
  max_concurrent INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, name)
);

ALTER TABLE docks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_docks_warehouse_id ON docks(warehouse_id);

-- Dock Schedules (per-dock time overrides)
CREATE TABLE dock_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dock_id UUID NOT NULL REFERENCES docks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  slot_duration_minutes INTEGER,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dock_id, day_of_week)
);

ALTER TABLE dock_schedules ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dock_schedules_dock_id ON dock_schedules(dock_id);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  dock_id UUID NOT NULL REFERENCES docks(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'arrived', 'completed', 'cancelled', 'no_show')),
  carrier_company VARCHAR(255) NOT NULL,
  carrier_contact_name VARCHAR(255),
  carrier_email VARCHAR(255),
  carrier_phone VARCHAR(50),
  license_plate VARCHAR(50),
  reference_number VARCHAR(255),
  notes TEXT,
  confirmation_code VARCHAR(8),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bookings_warehouse_id ON bookings(warehouse_id);
CREATE INDEX idx_bookings_dock_id ON bookings(dock_id);
CREATE INDEX idx_bookings_slot_start ON bookings(slot_start);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);

-- Subscriptions (Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'professional', 'business')),
  status VARCHAR(50) NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial', 'active', 'cancelled', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_warehouses
  BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_docks
  BEFORE UPDATE ON docks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
