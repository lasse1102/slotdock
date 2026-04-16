-- Enable REPLICA IDENTITY FULL on bookings table for Supabase Realtime
-- This ensures UPDATE/DELETE events include the full row data,
-- which is required for filtered Realtime subscriptions (e.g. by warehouse_id)
ALTER TABLE bookings REPLICA IDENTITY FULL;
