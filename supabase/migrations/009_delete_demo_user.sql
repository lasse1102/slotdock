-- Löscht den manuell angelegten Demo-User und alle zugehörigen Daten
DO $$
DECLARE
  uid UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  wid UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  DELETE FROM bookings        WHERE warehouse_id = wid;
  DELETE FROM dock_schedules  WHERE dock_id IN (SELECT id FROM docks WHERE warehouse_id = wid);
  DELETE FROM docks           WHERE warehouse_id = wid;
  DELETE FROM warehouses      WHERE id = wid;
  DELETE FROM subscriptions   WHERE profile_id = uid;
  DELETE FROM profiles        WHERE id = uid;
  DELETE FROM auth.users      WHERE id = uid;
END $$;
