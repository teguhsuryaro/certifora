# 04 — Storage Buckets & Auth Setup

> **Prasyarat:** RLS policies sudah dibuat (file `03_rls_policies.md` sudah selesai).
> **Eksekusi:** Kombinasi Supabase Dashboard UI dan SQL Editor.

---

## Tujuan

1. Membuat storage buckets untuk selfie dan template PDF.
2. Mengatur storage policies (siapa boleh upload/download).
3. Membuat akun superadmin pertama.

---

## Bagian 1: Storage Buckets

### Buat Bucket via SQL Editor

```sql
-- Buat bucket untuk selfie peserta (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('selfies', 'selfies', false);

-- Buat bucket untuk template sertifikat PDF (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-templates', 'certificate-templates', false);
```

### Storage Policies untuk Bucket `selfies`

```sql
-- Publik (anon) bisa upload selfie (saat registrasi)
CREATE POLICY "Public can upload selfies"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'selfies');

-- Admin bisa read selfie (untuk validasi)
CREATE POLICY "Admins can read selfies"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );

-- Admin bisa delete selfie
CREATE POLICY "Admins can delete selfies"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );
```

### Storage Policies untuk Bucket `certificate-templates`

```sql
-- Admin bisa upload template PDF
CREATE POLICY "Admins can upload templates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificate-templates'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );

-- Admin bisa read template PDF
CREATE POLICY "Admins can read templates"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificate-templates'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );

-- Admin bisa update/replace template PDF
CREATE POLICY "Admins can update templates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'certificate-templates'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );

-- Admin bisa delete template PDF
CREATE POLICY "Admins can delete templates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'certificate-templates'
    AND EXISTS (SELECT 1 FROM admins WHERE auth_id = auth.uid())
  );

-- Publik/Anon juga perlu read template (untuk generate PDF di browser saat kirim)
-- Ini aman karena template PDF bukan data sensitif
CREATE POLICY "Anon can read templates for PDF generation"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'certificate-templates');
```

> **Catatan:** Template PDF perlu bisa diakses oleh browser saat generate sertifikat. Karena PDF template bukanlah data sensitif (hanya layout kosong), ini aman dibuka untuk anon read. Alternatifnya: gunakan signed URL dari admin session saat generate.

---

## Bagian 2: Setup Akun Superadmin

### Langkah 1: Buat User di Supabase Auth

Buka **Authentication > Users** di Supabase Dashboard, lalu klik **"Add user"**:

- **Email:** masukkan email superadmin (misal `admin@certifora.com` atau email pribadi)
- **Password:** buat password yang kuat
- Centang **"Auto Confirm User"** agar tidak perlu verifikasi email

> **Catatan:** Certifora hanya punya 1 superadmin. Tidak perlu fitur registrasi admin.

### Langkah 2: Insert Data Admin ke Tabel `admins`

Setelah user dibuat di Auth, salin **User UID** dari halaman Authentication > Users, lalu jalankan SQL:

```sql
-- Ganti nilai di bawah dengan data sebenarnya
INSERT INTO admins (auth_id, full_name, email)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- User UID dari Supabase Auth
  'Nama Superadmin',                        -- Nama lengkap admin
  'admin@certifora.com'                     -- Email admin
);
```

### Langkah 3: Verifikasi

```sql
-- Pastikan data admin sudah masuk
SELECT * FROM admins;
```

---

## Bagian 3: Disable Sign-Up Publik (Opsional tapi Direkomendasikan)

Karena Certifora hanya punya 1 superadmin dan tidak ada fitur registrasi admin baru, sebaiknya matikan fitur sign-up publik:

1. Buka **Authentication > Providers** di Supabase Dashboard
2. Di bagian **Email**, matikan **"Enable Sign Up"** (set ke disabled/unchecked)

Ini mencegah orang lain mendaftarkan akun admin melalui Supabase Auth API.

---

## Kriteria Selesai

- [ ] Bucket `selfies` sudah dibuat (private)
- [ ] Bucket `certificate-templates` sudah dibuat (private)
- [ ] Storage policies sudah dibuat untuk kedua bucket
- [ ] Akun superadmin sudah dibuat di Supabase Auth
- [ ] Data admin sudah diinsert ke tabel `admins`
- [ ] Sign-up publik sudah dimatikan (opsional)
- [ ] Verifikasi: `SELECT * FROM admins` mengembalikan 1 row
