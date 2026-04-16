-- SlotDock Row Level Security Policies

-- ============================================
-- Auto-create profile on signup trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Profiles: users see and edit their own
-- ============================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- Warehouses: owner only
-- ============================================
CREATE POLICY "Users can view own warehouses"
  ON warehouses FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create warehouses"
  ON warehouses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own warehouses"
  ON warehouses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own warehouses"
  ON warehouses FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- Docks: owner via warehouse
-- ============================================
CREATE POLICY "Users can view own docks"
  ON docks FOR SELECT
  USING (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can create docks"
  ON docks FOR INSERT
  WITH CHECK (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update own docks"
  ON docks FOR UPDATE
  USING (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete own docks"
  ON docks FOR DELETE
  USING (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

-- ============================================
-- Dock Schedules: owner via dock -> warehouse
-- ============================================
CREATE POLICY "Users can view own dock schedules"
  ON dock_schedules FOR SELECT
  USING (
    dock_id IN (
      SELECT d.id FROM docks d
      JOIN warehouses w ON d.warehouse_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own dock schedules"
  ON dock_schedules FOR ALL
  USING (
    dock_id IN (
      SELECT d.id FROM docks d
      JOIN warehouses w ON d.warehouse_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- ============================================
-- Bookings: owner read/update, public insert via API route
-- ============================================
CREATE POLICY "Owners can view warehouse bookings"
  ON bookings FOR SELECT
  USING (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can update warehouse bookings"
  ON bookings FOR UPDATE
  USING (
    warehouse_id IN (SELECT id FROM warehouses WHERE owner_id = auth.uid())
  );

-- Public booking insert is handled via API route with service role key
-- No RLS INSERT policy needed for anonymous users

-- ============================================
-- Subscriptions: user sees own
-- ============================================
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (profile_id = auth.uid());
