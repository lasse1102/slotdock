-- ============================================================
--  SlotDock — Demo-Seeddaten (für registrierten Account)
--  Ziel-Account: demo@slotdock.de
-- ============================================================

DO $$
DECLARE
  uid  UUID;
  wid  UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  d1   UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  d2   UUID := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  d3   UUID := 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  d4   UUID := 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN

  -- User per E-Mail nachschlagen
  SELECT id INTO uid FROM auth.users WHERE email = 'demo@slotdock.de';
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User demo@slotdock.de nicht gefunden. Bitte zuerst registrieren.';
  END IF;

  -- Profil-Details ergänzen
  UPDATE profiles
  SET company_name = 'Norddeutsche Logistik GmbH',
      phone        = '+49 40 123456-0'
  WHERE id = uid;

  -- ----------------------------------------------------------
  -- Lager
  -- ----------------------------------------------------------
  INSERT INTO warehouses (
    id, owner_id, name,
    address_street, address_city, address_zip, address_country,
    opening_time, closing_time, timezone,
    booking_token, default_slot_duration_minutes, max_advance_booking_days
  ) VALUES (
    wid, uid, 'Logistikzentrum Hamburg-Süd',
    'Industriestraße 42', 'Hamburg', '21107', 'Deutschland',
    '07:00', '17:00', 'Europe/Berlin',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 45, 21
  ) ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- Rampen
  -- ----------------------------------------------------------
  INSERT INTO docks (id, warehouse_id, name, dock_type, max_concurrent, is_active, sort_order) VALUES
    (d1, wid, 'Rampe 1',             'general',      1, true, 1),
    (d2, wid, 'Rampe 2',             'general',      1, true, 2),
    (d3, wid, 'Rampe 3 – Kühlware', 'refrigerated', 1, true, 3),
    (d4, wid, 'Rampe 4 – Sperrgut', 'oversized',    1, true, 4)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO dock_schedules (dock_id, day_of_week, opening_time, closing_time, is_closed) VALUES
    (d3, 6, '07:00', '17:00', true),
    (d4, 0, '07:00', '17:00', true),
    (d4, 6, '07:00', '17:00', true)
  ON CONFLICT (dock_id, day_of_week) DO NOTHING;

  -- ----------------------------------------------------------
  -- Subscription
  -- ----------------------------------------------------------
  INSERT INTO subscriptions (profile_id, stripe_customer_id, plan, status, trial_ends_at)
  VALUES (uid, 'cus_demo00000000000', 'professional', 'active', NOW() + INTERVAL '30 days');

  -- ----------------------------------------------------------
  -- Buchungen — Vergangenheit
  -- ----------------------------------------------------------

  -- Woche –2, Montag (−12)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-12)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-12)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4521','PO-2026-10481','SD100001');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-12)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-12)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 8812','LS-2026-20934','SD100002');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-12)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-12)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 1122','AWB-2026-55891','SD100003');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-12)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-12)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'no_show','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 3344','PO-2026-10502','Fahrer nicht erschienen, keine Rückmeldung','SD100004');

  -- Woche –2, Dienstag (−11)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-11)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-11)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 7731','LS-2026-21045','SD100005');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-11)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-11)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 5566','PO-2026-10519','SD100006');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-11)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-11)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'cancelled','Hermes Fulfilment GmbH','Jan Braun','j.braun@hermesworld.com','+49 40 53750-300','HH-HF 2298','PO-2026-10533','Stornierung durch Spediteur, Ladung verschoben','SD100007');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-11)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-11)+TIME'16:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 4412','LS-2026-21067','SD100008');

  -- Woche –2, Mittwoch (−10)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-10)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-10)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 8871','AWB-2026-55942','SD100009');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-10)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-10)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4522','PO-2026-10547','SD100010');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-10)+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-10)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 6643','LS-2026-21089','SD100011');

  -- Woche –2, Donnerstag (−9)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-9)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-9)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 9001','LS-2026-21102','SD100012');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-9)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-9)+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'no_show','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 1122','AWB-2026-55978','Fahrer konnte Rampe nicht finden, keine Einfahrtsgenehmigung','SD100013');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-9)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-9)+TIME'16:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 8842','LS-2026-21118','SD100014');

  -- Woche –2, Freitag (−8)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-8)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-8)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 6677','PO-2026-10578','SD100015');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-8)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-8)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 5523','LS-2026-21130','SD100016');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-8)+TIME'16:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-8)+TIME'17:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'cancelled','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 8872','AWB-2026-56011','LKW überschreitet max. Achslast, Abweisung an Tor','SD100017');

  -- Woche –1, Montag (−5)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-5)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-5)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 7754','LS-2026-21145','SD100018');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-5)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-5)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 9900','PO-2026-10601','SD100019');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-5)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-5)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 4455','LS-2026-21159','SD100020');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-5)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-5)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 9953','PO-2026-10615','SD100021');

  -- Woche –1, Dienstag (−4)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-4)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-4)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 2233','AWB-2026-56042','SD100022');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-4)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-4)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 7788','PO-2026-10628','SD100023');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-4)+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-4)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'arrived','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 6634','LS-2026-21172','Kühlware: Temperatur bei Ankunft prüfen','SD100024');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-4)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-4)+TIME'16:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4523','PO-2026-10641','SD100025');

  -- Woche –1, Mittwoch (−3)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-3)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-3)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 9982','AWB-2026-56067','SD100026');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-3)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-3)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 8865','PO-2026-10654','SD100027');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-3)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-3)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'no_show','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 5566','LS-2026-21198','Keine Abmeldung, Buchung verfällt nach 30 Min.','SD100028');

  -- Woche –1, Donnerstag (−2)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-2)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-2)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 0064','PO-2026-10667','SD100029');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-2)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-2)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 3344','AWB-2026-56089','SD100030');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-2)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-2)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4524','LS-2026-21211','SD100031');

  -- Woche –1, Freitag (−1)
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE-1)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-1)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 9901','PO-2026-10681','SD100032');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE-1)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-1)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 8899','LS-2026-21224','SD100033');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE-1)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-1)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 7745','PO-2026-10695','SD100034');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE-1)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE-1)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'completed','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 0093','LS-2026-21237','SD100035');

  -- ----------------------------------------------------------
  -- Heute: Morgen → arrived, Nachmittag → confirmed
  -- ----------------------------------------------------------
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, (CURRENT_DATE+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'arrived','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4525','PO-2026-10708','SD100036');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d3, (CURRENT_DATE+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'arrived','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 4455','AWB-2026-56112','Kühlcontainer, Temperatur −18 °C, Prioritätsentladung','SD100037');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, (CURRENT_DATE+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'arrived','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 1175','PO-2026-10721','SD100038');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, (CURRENT_DATE+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 9976','LS-2026-21250','SD100039');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d1, (CURRENT_DATE+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 6677','PO-2026-10734','Europaletten, Hubwagen bereitstellen','SD100040');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, (CURRENT_DATE+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', (CURRENT_DATE+TIME'16:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 0011','LS-2026-21263','SD100041');

  -- ----------------------------------------------------------
  -- Zukunft: confirmed
  -- ----------------------------------------------------------

  -- +1 Tag
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+1)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+1)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 9900','PO-2026-10747','SD100042');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE+1)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+1)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 8856','LS-2026-21276','SD100043');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE+1)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+1)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 2215','AWB-2026-56145','Schwergut 18 t, Kran nicht verfügbar — Stapler reicht','SD100044');

  -- +2 Tage
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE+2)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+2)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4526','PO-2026-10760','SD100045');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+2)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+2)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 0087','LS-2026-21289','SD100046');

  -- +5 Tage
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE+5)+TIME'07:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+5)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 5566','AWB-2026-56178','SD100047');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE+5)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+5)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 2286','PO-2026-10773','SD100048');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+5)+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+5)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 7788','LS-2026-21302','SD100049');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE+5)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+5)+TIME'16:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Hellmann Worldwide Logistics','Maria Weber','m.weber@hellmann.net','+49 541 605-200','OS-HW 1011','PO-2026-10786','Hebebühne anfordern: Ladegut ca. 2,4 m Höhe','SD100050');

  -- +7 Tage
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+7)+TIME'07:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+7)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','UPS Deutschland GmbH','Lisa Koch','l.koch@ups.com','+49 1806 877-877','DU-UP 9967','LS-2026-21315','SD100051');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE+7)+TIME'10:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+7)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Rhenus Logistics AG & Co. KG','Marco Bauer','m.bauer@rhenus.com','+49 2306 7669-100','DO-RH 3326','AWB-2026-56201','SD100052');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE+7)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+7)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DB Schenker GmbH','Klaus Hoffmann','lager.hh@dbschenker.com','+49 40 3000-100','HH-DS 4527','PO-2026-10799','SD100053');

  -- +10 Tage
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+10)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+10)+TIME'10:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DHL Freight GmbH','Sandra Meier','s.meier@dhl.com','+49 228 4333-200','HH-DH 2233','LS-2026-21328','SD100054');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, notes, confirmation_code) VALUES
  (wid, d3, ((CURRENT_DATE+10)+TIME'11:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+10)+TIME'12:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Kühne+Nagel GmbH & Co. KG','Bernd Schulze','b.schulze@kuehne-nagel.com','+49 40 3030-300','HB-KN 6677','AWB-2026-56234','Frischware: Anlieferfenster streng einhalten','SD100055');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d4, ((CURRENT_DATE+10)+TIME'14:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+10)+TIME'15:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','Fiege Logistik SE','Anna Richter','a.richter@fiege.com','+49 2571 999-200','ST-FL 1198','PO-2026-10812','SD100056');

  -- +12 Tage
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d2, ((CURRENT_DATE+12)+TIME'08:30')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+12)+TIME'09:15')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','GLS Germany GmbH & Co. OHG','Thomas Krüger','t.krueger@gls-group.eu','+49 9001 599-100','HH-GL 3397','LS-2026-21341','SD100057');
  INSERT INTO bookings (warehouse_id, dock_id, slot_start, slot_end, status, carrier_company, carrier_contact_name, carrier_email, carrier_phone, license_plate, reference_number, confirmation_code) VALUES
  (wid, d1, ((CURRENT_DATE+12)+TIME'13:00')::TIMESTAMP AT TIME ZONE 'Europe/Berlin', ((CURRENT_DATE+12)+TIME'13:45')::TIMESTAMP AT TIME ZONE 'Europe/Berlin',
   'confirmed','DACHSER SE','Andrea Fischer','a.fischer@dachser.com','+49 831 5916-400','MUC-DA 8899','PO-2026-10825','SD100058');

END $$;
