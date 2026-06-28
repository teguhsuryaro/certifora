# 03 — Struktur Folder Proyek

> **Prasyarat:** Dependencies sudah terinstall (file `02_install_dependencies.md` sudah selesai).
> **Folder kerja:** `e:\CODING\certifora\`

---

## Tujuan

Membuat struktur folder yang terorganisir untuk seluruh kode sumber Certifora.

---

## Struktur Folder yang Harus Dibuat

Buat folder-folder berikut di dalam `src/`:

```
src/
├── assets/                     # Gambar, ikon statis
├── components/                 # Komponen UI reusable
│   ├── ui/                     # Komponen primitif (Button, Modal, Badge, dll)
│   ├── layout/                 # Layout wrapper (AdminLayout, PublicLayout)
│   └── shared/                 # Komponen bisnis yang dipakai di banyak tempat
├── pages/                      # Halaman-halaman (1 file = 1 route)
│   ├── public/                 # Halaman publik (landing, register, verify, closed)
│   └── admin/                  # Halaman admin (dashboard, event, participants, dll)
├── hooks/                      # Custom React hooks
├── lib/                        # Library & utility functions
│   ├── supabase.ts             # Supabase client initialization
│   ├── pdf-generator.ts        # Logic generate PDF dengan pdf-lib
│   ├── qr-generator.ts         # Logic generate QR code
│   └── image-compressor.ts     # Logic kompresi gambar selfie
├── stores/                     # Zustand stores
├── types/                      # TypeScript type definitions
│   └── database.ts             # Types yang sesuai skema Supabase
├── constants/                  # Konstanta (warna status, config, dll)
├── services/                   # API service layer (Supabase queries)
├── App.tsx                     # Root component + Router
├── main.tsx                    # Entry point
└── index.css                   # Tailwind imports + custom theme
```

Dan di folder `public/`:

```
public/
├── fonts/                      # Font Google Fonts yang di-self-host
│   ├── Inter/
│   ├── Poppins/
│   ├── Montserrat/
│   ├── PlayfairDisplay/
│   └── Roboto/
└── favicon.svg                 # Favicon Certifora
```

---

## Langkah Membuat Folder

Jalankan perintah berikut di folder root proyek:

```bash
# Struktur src
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/shared
mkdir -p src/pages/public
mkdir -p src/pages/admin
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/services

# Struktur public
mkdir -p public/fonts/Inter
mkdir -p public/fonts/Poppins
mkdir -p public/fonts/Montserrat
mkdir -p public/fonts/PlayfairDisplay
mkdir -p public/fonts/Roboto
```

> **Catatan untuk Windows PowerShell:** Jika `mkdir -p` tidak tersedia, gunakan:
> ```powershell
> New-Item -ItemType Directory -Force -Path "src\components\ui"
> # ...dst untuk setiap path
> ```

---

## File Placeholder

Buat file `.gitkeep` kosong di setiap folder baru agar Git mentrack folder kosong:

```bash
# Contoh (lakukan untuk semua folder baru)
touch src/components/ui/.gitkeep
touch src/components/layout/.gitkeep
# ...dst
```

Atau buat file placeholder yang akan segera diisi:

### `src/types/database.ts`

```typescript
// Type definitions untuk tabel Supabase
// Akan diisi di tahap 02_supabase_setup

export {}
```

### `src/lib/supabase.ts`

```typescript
// Supabase client initialization
// Akan diisi di tahap 02_supabase_setup

export {}
```

### `src/constants/index.ts`

```typescript
// Konstanta aplikasi

export const APP_NAME = 'Certifora'

export const EVENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  TEMPORARILY_CLOSED: 'temporarily_closed',
  PERMANENTLY_CLOSED: 'permanently_closed',
} as const

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

export const TEXT_FORMAT = {
  ORIGINAL: 'original',
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  TITLE_CASE: 'title_case',
} as const

export const QR_POSITION = {
  TOP_LEFT: 'top_left',
  TOP_RIGHT: 'top_right',
  BOTTOM_LEFT: 'bottom_left',
  BOTTOM_RIGHT: 'bottom_right',
} as const

// Batas pengiriman email harian (sisakan buffer 10 dari limit 100 Resend)
export const DAILY_EMAIL_LIMIT = 90

// Ukuran maksimal selfie sebelum kompresi (5 MB)
export const MAX_SELFIE_SIZE_MB = 5

// Format file selfie yang diterima
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
```

---

## Kriteria Selesai

- [ ] Seluruh folder di bawah `src/` sudah dibuat sesuai struktur
- [ ] Folder `public/fonts/` sudah dibuat dengan subfolder untuk setiap font
- [ ] File `src/types/database.ts` sudah ada (placeholder)
- [ ] File `src/lib/supabase.ts` sudah ada (placeholder)
- [ ] File `src/constants/index.ts` sudah ada dengan konstanta dasar
- [ ] Proyek masih bisa di-build tanpa error (`npm run dev`)
