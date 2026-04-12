-- Migration: Add booking function with race condition protection
-- The confirmation_code column already exists in the initial schema (001),
-- so we only create the atomic booking function here.

-- Create the atomic booking function
CREATE OR REPLACE FUNCTION create_booking_if_available(
  p_warehouse_id UUID,
  p_dock_id UUID,
  p_slot_start TIMESTAMPTZ,
  p_slot_end TIMESTAMPTZ,
  p_carrier_company VARCHAR,
  p_carrier_contact_name VARCHAR DEFAULT NULL,
  p_carrier_email VARCHAR DEFAULT NULL,
  p_carrier_phone VARCHAR DEFAULT NULL,
  p_license_plate VARCHAR DEFAULT NULL,
  p_reference_number VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_confirmation_code VARCHAR DEFAULT NULL
)
RETURNS SETOF bookings
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_concurrent INTEGER;
  v_overlap_count INTEGER;
  v_new_booking bookings%ROWTYPE;
BEGIN
  -- Lock the dock row to prevent concurrent booking races
  SELECT max_concurrent INTO v_max_concurrent
  FROM docks
  WHERE id = p_dock_id AND warehouse_id = p_warehouse_id AND is_active = true
  FOR UPDATE;

  -- Dock not found or inactive
  IF v_max_concurrent IS NULL THEN
    RETURN;
  END IF;

  -- Count overlapping non-cancelled bookings
  SELECT COUNT(*) INTO v_overlap_count
  FROM bookings
  WHERE dock_id = p_dock_id
    AND status != 'cancelled'
    AND slot_start < p_slot_end
    AND slot_end > p_slot_start;

  -- Check capacity
  IF v_overlap_count >= v_max_concurrent THEN
    RETURN;
  END IF;

  -- Insert the new booking
  INSERT INTO bookings (
    warehouse_id, dock_id, slot_start, slot_end,
    status, carrier_company, carrier_contact_name,
    carrier_email, carrier_phone, license_plate,
    reference_number, notes, confirmation_code
  ) VALUES (
    p_warehouse_id, p_dock_id, p_slot_start, p_slot_end,
    'confirmed', p_carrier_company, p_carrier_contact_name,
    p_carrier_email, p_carrier_phone, p_license_plate,
    p_reference_number, p_notes, p_confirmation_code
  )
  RETURNING * INTO v_new_booking;

  RETURN NEXT v_new_booking;
END;
$$;
