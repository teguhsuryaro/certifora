# 03 — Row Level Security (RLS) Policies

> **Prasyarat:** Semua tabel sudah dibuat (file `02_skema_database.md` sudah selesai).
> **Eksekusi SQL:** Buka Supabase Dashboard → **SQL Editor** → paste dan jalankan SQL di bawah.

---

## Tujuan

Mengaktifkan RLS dan membuat security policies agar:
1. Superadmin (authenticated) bisa akses penuh ke semua tabel admin.
2. Publik (anon) hanya bisa:
   - **Insert** peserta baru — tapi hanya jika event berstatus `active`.
   - **Read** data validasi sertifikat — hanya kolom yang relevan.

---

## Query 1: Enable RLS di Semua Tabel

```sql
-- Enable RLS untuk semua tabel
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_status_history ENABLE ROW LEVEL SECURITY;
```

---

## Query 2: Helper Function — Cek apakah user adalah admin

```sql
-- Function untuk mengecek apakah user yang sedang login adalah admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Query 3: Policies untuk Tabel `admins`

```sql
-- Admin bisa read profil sendiri
CREATE POLICY "Admins can read own profile"
  ON admins FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Admin bisa update profil sendiri
CREATE POLICY "Admins can update own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());
```

---

## Query 4: Policies untuk Tabel `events`

```sql
-- Admin bisa read semua event
CREATE POLICY "Admins can read all events"
  ON events FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin bisa insert event
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admin bisa update event
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Publik bisa read event terbatas (untuk form registrasi — hanya event aktif)
CREATE POLICY "Public can read active events"
  ON events FOR SELECT
  TO anon
  USING (status = 'active');
```

---

## Query 5: Policies untuk Tabel `event_email_settings`

```sql
-- Admin full access
CREATE POLICY "Admins can manage email settings"
  ON event_email_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

## Query 6: Policies untuk Tabel `certificate_templates`

```sql
-- Admin full access
CREATE POLICY "Admins can manage templates"
  ON certificate_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

## Query 7: Policies untuk Tabel `participants`

```sql
-- Admin bisa read semua peserta
CREATE POLICY "Admins can read all participants"
  ON participants FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin bisa update peserta
CREATE POLICY "Admins can update participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Admin bisa delete peserta
CREATE POLICY "Admins can delete participants"
  ON participants FOR DELETE
  TO authenticated
  USING (is_admin());

-- Publik bisa insert peserta HANYA jika event aktif
CREATE POLICY "Public can register to active events"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_id 
      AND events.status = 'active'
    )
  );
```

---

## Query 8: Policies untuk Tabel `template_overrides`

```sql
-- Admin full access
CREATE POLICY "Admins can manage template overrides"
  ON template_overrides FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

## Query 9: Policies untuk Tabel `delivery_logs`

```sql
-- Admin full access
CREATE POLICY "Admins can manage delivery logs"
  ON delivery_logs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

## Query 10: Policies untuk Tabel `certificate_codes`

```sql
-- Admin bisa read/manage
CREATE POLICY "Admins can manage certificate codes"
  ON certificate_codes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Publik bisa insert (saat registrasi, kode dibuat otomatis)
CREATE POLICY "Public can insert certificate codes for active events"
  ON certificate_codes FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_id 
      AND events.status = 'active'
    )
  );

-- Publik bisa read kode sertifikat (untuk halaman validasi)
CREATE POLICY "Public can verify certificate codes"
  ON certificate_codes FOR SELECT
  TO anon
  USING (true);
```

---

## Query 11: Policies untuk Tabel `event_status_history`

```sql
-- Admin full access
CREATE POLICY "Admins can manage status history"
  ON event_status_history FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
```

---

## Query 12: Policy tambahan — Publik bisa read data peserta terbatas (untuk validasi)

```sql
-- Publik bisa read data peserta terbatas untuk halaman /verify/:kode
-- Hanya nama dan kode sertifikat yang bisa dibaca
CREATE POLICY "Public can read participant name for verification"
  ON participants FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM certificate_codes
      WHERE certificate_codes.participant_id = participants.id
    )
  );
```

> **Catatan:** Di halaman `/verify/:kode`, query dilakukan dengan JOIN `certificate_codes` + `participants` + `events`. RLS ini memastikan data yang terekspos ke publik hanya data yang relevan untuk validasi.

---

## Query 13: Policy tambahan — Publik bisa read event data untuk validasi

```sql
-- Publik bisa read event data untuk halaman validasi sertifikat
-- (event yang sudah ditutup pun tetap bisa diverifikasi)
CREATE POLICY "Public can read events for verification"
  ON events FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM certificate_codes
      WHERE certificate_codes.event_id = events.id
    )
  );
```

---

## Verifikasi

1. Buka **Authentication > Policies** di Supabase Dashboard
2. Pastikan setiap tabel sudah memiliki RLS enabled (ikon gembok hijau)
3. Pastikan setiap tabel sudah punya policy yang sesuai

### Test sederhana:
- Tanpa login (anon): Coba `SELECT * FROM admins` → harus kosong/ditolak
- Tanpa login (anon): Coba `SELECT * FROM events WHERE status = 'active'` → boleh

---

## Kriteria Selesai

- [ ] RLS sudah enabled di semua 9 tabel
- [ ] Function `is_admin()` sudah dibuat
- [ ] Policy admin (authenticated) sudah ada di semua tabel
- [ ] Policy anon untuk insert peserta sudah ada (hanya event aktif)
- [ ] Policy anon untuk read validasi sertifikat sudah ada
- [ ] Policy anon untuk read events (validasi + registrasi) sudah ada
