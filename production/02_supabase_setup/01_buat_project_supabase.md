# 01 — Membuat Project Supabase & Konfigurasi Awal

> **Prasyarat:** Proyek frontend sudah diinisialisasi (folder `01_project_setup` sudah selesai).
> **Akun Supabase:** Daftar gratis di [supabase.com](https://supabase.com) — tanpa kartu kredit.

---

## Tujuan

Membuat project Supabase baru dan menghubungkan frontend ke Supabase.

---

## 1. Buat Project Supabase

1. Login ke [app.supabase.com](https://app.supabase.com)
2. Klik **"New project"**
3. Isi:
   - **Organization:** Pilih atau buat baru (free tier: maks 2 organisasi aktif)
   - **Project name:** `certifora`
   - **Database password:** Catat dan simpan di tempat aman (untuk akses database langsung jika perlu)
   - **Region:** Pilih yang terdekat (misal Singapore `ap-southeast-1` untuk Indonesia)
4. Klik **"Create new project"**
5. Tunggu hingga project selesai di-provision (beberapa menit)

---

## 2. Ambil Kredensial

Setelah project jadi, buka **Settings > API** dan catat:

| Nilai | Contoh | Dipakai di |
|-------|--------|-----------|
| **Project URL** | `https://xxxxx.supabase.co` | `.env` frontend |
| **anon/public key** | `eyJhbGciOiJIUzI1NiIs...` | `.env` frontend |
| **service_role key** | `eyJhbGciOiJIUzI1NiIs...` | Supabase Edge Function SAJA |

> ⚠️ **PENTING:** `service_role key` HANYA untuk Edge Function. JANGAN masukkan ke frontend!

---

## 3. Isi File `.env` di Frontend

Buka file `.env` dan isi:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_APP_URL=http://localhost:5173
```

---

## 4. Buat Supabase Client di Frontend

Isi file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

---

## 5. Verifikasi Koneksi

Tambahkan sementara di `src/App.tsx` untuk tes koneksi:

```typescript
import { useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('events').select('*').limit(1)
      if (error) {
        console.log('Supabase connected, but table may not exist yet:', error.message)
      } else {
        console.log('Supabase connected successfully:', data)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-indigo-600">
        Certifora — Coming Soon
      </h1>
    </div>
  )
}

export default App
```

> Buka browser console. Jika muncul pesan "Supabase connected" (baik sukses maupun error tabel belum ada), berarti koneksi berhasil. **Hapus kode test ini setelah verifikasi.**

---

## Kriteria Selesai

- [ ] Project Supabase `certifora` sudah dibuat
- [ ] Kredensial (URL + anon key) sudah disalin ke `.env`
- [ ] File `src/lib/supabase.ts` sudah berisi Supabase client
- [ ] Koneksi ke Supabase berhasil diverifikasi via browser console
