# Arsitektur Sistem Certifora

## Diagram Arsitektur Tingkat Tinggi

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PENGGUNA / BROWSER                          │
│                                                                      │
│  ┌─────────────────┐    ┌──────────────────────────────────────────┐ │
│  │   Peserta (HP)  │    │         Superadmin (Desktop)             │ │
│  │                 │    │                                          │ │
│  │  - Scan QR      │    │  - Login                                 │ │
│  │  - Isi Form     │    │  - Kelola Event                          │ │
│  │  - Upload Selfie│    │  - Atur Template (drag & drop)           │ │
│  │  - Verifikasi   │    │  - Preview/Kirim Sertifikat              │ │
│  │    Sertifikat   │    │  - Export Data                           │ │
│  └────────┬────────┘    │  - Generate PDF (client-side, pdf-lib)   │ │
│           │             └──────────────────┬───────────────────────┘ │
│           │                                │                         │
└───────────┼────────────────────────────────┼─────────────────────────┘
            │                                │
            ▼                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend Hosting)                      │
│                                                                      │
│    React 18 + Vite + TypeScript + Tailwind CSS                      │
│    certifora.vercel.app                                              │
│                                                                      │
│    Routing:                                                          │
│    /                           → Landing Page                       │
│    /login                      → Login Superadmin                   │
│    /event/:id/register         → Form Registrasi (publik)           │
│    /event/:id/closed           → Event Ditutup (publik)             │
│    /verify/:kode               → Validasi Sertifikat (publik)       │
│    /admin/dashboard            → Daftar Event                       │
│    /admin/events/new           → Buat Event                         │
│    /admin/events/:id           → Detail Event                       │
│    /admin/events/:id/template  → Editor Template                    │
│    /admin/events/:id/participants     → Dashboard Peserta           │
│    /admin/events/:id/participants/:id → Detail Peserta              │
│    /admin/events/:id/export    → Export Data                        │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Free Plan)                           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Database    │  │   Storage    │  │    Edge Functions        │  │
│  │  PostgreSQL   │  │   (1 GB)    │  │    (Deno runtime)        │  │
│  │   (500 MB)    │  │             │  │                          │  │
│  │              │  │  Buckets:   │  │  send-certificate-email  │  │
│  │  9 Tabel:    │  │  - selfies/ │  │  → Terima PDF (base64)   │  │
│  │  - admins    │  │  - cert-    │  │  → Kirim via Resend API  │  │
│  │  - events    │  │    templates│  │                          │  │
│  │  - event_    │  │            │  │  Env vars:               │  │
│  │    email_    │  │             │  │  - RESEND_API_KEY        │  │
│  │    settings  │  │             │  │  - SUPABASE_SERVICE_     │  │
│  │  - cert_     │  │             │  │    ROLE_KEY              │  │
│  │    templates │  │             │  │                          │  │
│  │  - template_ │  │             │  └──────────────────────────┘  │
│  │    overrides │  │             │                                 │
│  │  - partici-  │  │             │  ┌──────────────────────────┐  │
│  │    pants     │  │             │  │    Auth                  │  │
│  │  - delivery_ │  │             │  │    Email/Password        │  │
│  │    logs      │  │             │  │    1 Superadmin          │  │
│  │  - cert_     │  │             │  │                          │  │
│  │    codes     │  │             │  │    RLS Policies:         │  │
│  │  - event_    │  │             │  │    - Admin: full access  │  │
│  │    status_   │  │             │  │    - Anon: insert peserta│  │
│  │    history   │  │             │  │      (event aktif only)  │  │
│  │              │  │             │  │    - Anon: read verify   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ (API call dari Edge Function)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      RESEND (Free Plan)                             │
│                                                                      │
│    100 email/hari, 3.000 email/bulan                                │
│    Kirim email + attachment PDF sertifikat                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                  GITHUB ACTIONS (Cron Job)                          │
│                                                                      │
│    keep-supabase-alive.yml                                           │
│    Jadwal: Senin, Rabu, Jumat pukul 03:00 UTC                      │
│    Aksi: ping Supabase REST API agar project tidak auto-pause       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Alur Data Utama

### 1. Registrasi Peserta
```
Peserta scan QR → Buka /event/:id/register → Isi form (nama, email, selfie)
  → Kompresi selfie di browser → Upload ke Supabase Storage (selfies/)
  → Insert data ke tabel participants → Generate kode sertifikat unik
  → Tampilkan konfirmasi
```

### 2. Generate & Kirim Sertifikat
```
Superadmin klik "Kirim" → Browser fetch template PDF dari Supabase Storage
  → pdf-lib buka PDF → drawText (nama peserta) + drawImage (QR code)
  → Export PDF sebagai Blob/base64
  → Kirim ke Supabase Edge Function
  → Edge Function kirim email via Resend API (PDF sebagai attachment)
  → Update delivery_logs (berhasil/gagal)
```

### 3. Validasi Sertifikat
```
Penerima scan QR di sertifikat → Buka /verify/:kode
  → Query tabel certificate_codes + participants + events
  → Tampilkan status valid/tidak valid + detail
```

---

## Relasi Antar Tabel

```
admins
  └── (auth: Supabase Auth uid)

events
  ├── event_email_settings (1:1)
  ├── certificate_templates (1:1)
  ├── event_status_history (1:N) — log perubahan status
  └── participants (1:N)
        ├── template_overrides (1:1, opsional) — override posisi khusus peserta
        ├── delivery_logs (1:N) — riwayat kirim
        └── certificate_codes (1:1) — kode unik sertifikat
```

---

## Keamanan

| Akses | Siapa | Mekanisme |
|-------|-------|-----------|
| Dashboard admin | Superadmin (authenticated) | Supabase Auth + RLS |
| Insert peserta | Publik (anon) | RLS: hanya jika event status = 'active' |
| Read validasi | Publik (anon) | RLS: read-only, kolom terbatas |
| API key Resend | Server-side only | Supabase Edge Function env var |
| Service Role Key | Server-side only | Tidak pernah di frontend |

---

## Catatan Teknis Penting

1. **PDF tidak pernah disimpan permanen** — dibuat di browser saat kirim, langsung dikirim sebagai attachment, lalu dibuang dari memory.
2. **Selfie dikompresi di browser** sebelum upload ke Supabase Storage untuk menghemat kuota 1 GB.
3. **Batching email**: Maksimal 90 email/hari (sisakan buffer 10 dari limit 100/hari Resend). Sisanya masuk antrian "Belum Dikirim".
4. **Font disediakan di `/public/fonts/`** — Google Fonts open source (Inter, Poppins, Montserrat, dll) di-self-host, bukan fetch dari CDN saat generate PDF.
5. **Supabase auto-pause dicegah** dengan GitHub Actions cron job 3x/minggu.
