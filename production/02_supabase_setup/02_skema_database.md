# 02 — Skema Database (SQL Migrations)

> **Prasyarat:** Project Supabase sudah dibuat dan terkoneksi (file `01_buat_project_supabase.md` sudah selesai).
> **Eksekusi SQL:** Buka Supabase Dashboard → **SQL Editor** → paste dan jalankan SQL di bawah.

---

## Tujuan

Membuat seluruh 9 tabel database sesuai spesifikasi, beserta index, constraint, dan trigger.

---

## Urutan Eksekusi SQL

Jalankan SQL berikut **secara berurutan** di SQL Editor Supabase. Setiap blok adalah satu query yang harus di-Run terpisah.

---

### Query 1: Tabel `admins`

```sql
-- Tabel admins: data superadmin (terhubung ke Supabase Auth)
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_admins_auth_id ON admins(auth_id);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 2: Tabel `events`

```sql
-- Tipe enum untuk status event
CREATE TYPE event_status AS ENUM ('draft', 'active', 'temporarily_closed', 'permanently_closed');

-- Tabel events: data event
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  organizer TEXT NOT NULL,
  location TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  prefix TEXT NOT NULL,  -- prefix untuk kode sertifikat, misal "WEBINARAI"
  status event_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_events_admin_id ON events(admin_id);
CREATE INDEX idx_events_status ON events(status);

-- Trigger auto-update updated_at
CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 3: Tabel `event_email_settings`

```sql
-- Tabel event_email_settings: pengaturan email per event
CREATE TABLE event_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT 'Sertifikat Anda',
  title TEXT NOT NULL DEFAULT 'Sertifikat Kehadiran',
  body TEXT NOT NULL DEFAULT 'Terima kasih atas partisipasi Anda. Berikut terlampir sertifikat Anda.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger auto-update updated_at
CREATE TRIGGER trigger_event_email_settings_updated_at
  BEFORE UPDATE ON event_email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 4: Tabel `certificate_templates`

```sql
-- Tipe enum untuk posisi QR
CREATE TYPE qr_position AS ENUM ('top_left', 'top_right', 'bottom_left', 'bottom_right');

-- Tipe enum untuk format teks nama
CREATE TYPE text_format AS ENUM ('original', 'uppercase', 'lowercase', 'title_case');

-- Tabel certificate_templates: template sertifikat per event
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  
  -- File template PDF
  template_file_path TEXT,          -- path di Supabase Storage
  template_file_name TEXT,          -- nama file asli yang diupload
  
  -- Pengaturan nama peserta di sertifikat
  name_position_x FLOAT NOT NULL DEFAULT 50.0,   -- posisi X dalam persen (0-100)
  name_position_y FLOAT NOT NULL DEFAULT 50.0,   -- posisi Y dalam persen (0-100)
  name_font_size INTEGER NOT NULL DEFAULT 24,     -- ukuran font dalam pt
  name_font_color TEXT NOT NULL DEFAULT '#000000', -- warna font hex
  name_font_family TEXT NOT NULL DEFAULT 'Inter',  -- nama font
  name_text_format text_format NOT NULL DEFAULT 'original',
  
  -- Pengaturan QR Code
  qr_position qr_position NOT NULL DEFAULT 'bottom_right',
  qr_size INTEGER NOT NULL DEFAULT 80,             -- ukuran QR dalam pixel
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger auto-update updated_at
CREATE TRIGGER trigger_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 5: Tabel `participants`

```sql
-- Tipe enum untuk status pengiriman
CREATE TYPE delivery_status AS ENUM ('pending', 'success', 'failed');

-- Tabel participants: data peserta per event
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  selfie_path TEXT,               -- path foto selfie di Supabase Storage
  certificate_code TEXT NOT NULL UNIQUE,  -- kode sertifikat unik, misal "WEBINARAI-7729"
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_participants_certificate_code ON participants(certificate_code);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_delivery_status ON participants(delivery_status);

-- Trigger auto-update updated_at
CREATE TRIGGER trigger_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 6: Tabel `template_overrides`

```sql
-- Tabel template_overrides: override posisi/font khusus per peserta
CREATE TABLE template_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  
  -- Override posisi dan ukuran (null = pakai dari template utama)
  name_position_x FLOAT,
  name_position_y FLOAT,
  name_font_size INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_template_overrides_participant_id ON template_overrides(participant_id);

-- Trigger auto-update updated_at
CREATE TRIGGER trigger_template_overrides_updated_at
  BEFORE UPDATE ON template_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Query 7: Tabel `delivery_logs`

```sql
-- Tabel delivery_logs: riwayat status pengiriman per peserta
CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  status delivery_status NOT NULL,
  error_message TEXT,             -- pesan error jika gagal
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_delivery_logs_participant_id ON delivery_logs(participant_id);
CREATE INDEX idx_delivery_logs_sent_at ON delivery_logs(sent_at);
```

---

### Query 8: Tabel `certificate_codes`

```sql
-- Tabel certificate_codes: index kode sertifikat untuk validasi cepat & cegah duplikat
CREATE TABLE certificate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,       -- misal "WEBINARAI-7729"
  participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_certificate_codes_code ON certificate_codes(code);
CREATE INDEX idx_certificate_codes_event_id ON certificate_codes(event_id);
```

---

### Query 9: Tabel `event_status_history`

```sql
-- Tabel event_status_history: log perubahan status event (audit trail)
CREATE TABLE event_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  old_status event_status,
  new_status event_status NOT NULL,
  changed_by UUID REFERENCES admins(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_event_status_history_event_id ON event_status_history(event_id);
CREATE INDEX idx_event_status_history_changed_at ON event_status_history(changed_at);
```

---

## Verifikasi

Setelah menjalankan semua query, buka **Table Editor** di Supabase Dashboard. Pastikan ada **9 tabel**:

1. `admins`
2. `events`
3. `event_email_settings`
4. `certificate_templates`
5. `participants`
6. `template_overrides`
7. `delivery_logs`
8. `certificate_codes`
9. `event_status_history`

---

## Kriteria Selesai

- [ ] 9 tabel sudah dibuat tanpa error
- [ ] Semua enum type (`event_status`, `qr_position`, `text_format`, `delivery_status`) sudah dibuat
- [ ] Index sudah dibuat untuk kolom yang sering di-query
- [ ] Trigger `updated_at` berfungsi di tabel yang memerlukannya
- [ ] Relasi foreign key sudah benar (cek di Table Editor → Relationships)
