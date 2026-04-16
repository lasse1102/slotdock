-- Add notification preference to profiles
ALTER TABLE profiles
  ADD COLUMN notify_new_bookings BOOLEAN NOT NULL DEFAULT true;
