# 02 — Install Dependencies Proyek

> **Prasyarat:** Proyek Vite sudah diinisialisasi (file `01_inisialisasi_vite.md` sudah selesai).
> **Folder kerja:** `e:\CODING\certifora\`

---

## Tujuan

Menginstall seluruh library/dependency yang dibutuhkan oleh Certifora sesuai spesifikasi.

---

## Daftar Dependencies

### Dependencies Utama (Production)

```bash
npm install @supabase/supabase-js zustand react-router-dom pdf-lib qrcode browser-image-compression react-draggable xlsx file-saver
```

| Package | Kegunaan |
|---------|----------|
| `@supabase/supabase-js` | Supabase client (database, auth, storage) |
| `zustand` | State management ringan |
| `react-router-dom` | Client-side routing |
| `pdf-lib` | Generate/manipulasi PDF di browser |
| `qrcode` | Generate QR code sebagai image |
| `browser-image-compression` | Kompresi gambar selfie sebelum upload |
| `react-draggable` | Drag-and-drop elemen di editor template |
| `xlsx` | Export data peserta ke Excel |
| `file-saver` | Trigger download file di browser |

### Dependencies Development (Dev Only)

```bash
npm install -D tailwindcss @tailwindcss/vite @types/qrcode @types/file-saver
```

| Package | Kegunaan |
|---------|----------|
| `tailwindcss` | Framework CSS utility-first |
| `@tailwindcss/vite` | Plugin Vite untuk Tailwind CSS v4 |
| `@types/qrcode` | TypeScript types untuk qrcode |
| `@types/file-saver` | TypeScript types untuk file-saver |

---

## Konfigurasi Tailwind CSS v4

### 1. Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 2. Update `src/index.css`

Ganti seluruh isi file `src/index.css` dengan:

```css
@import "tailwindcss";
```

> **Catatan:** Tailwind CSS v4 tidak lagi membutuhkan file `tailwind.config.js`. Konfigurasi tema dilakukan langsung di CSS menggunakan `@theme`. Konfigurasi tema detail akan dibuat di folder `04_design_system`.

### 3. Bersihkan File Default

Hapus atau kosongkan file-file default yang tidak diperlukan:
- Hapus `src/App.css` (styling akan pakai Tailwind sepenuhnya)
- Ganti isi `src/App.tsx` dengan placeholder sederhana:

```tsx
function App() {
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

---

## Verifikasi

```bash
npm run dev
```

Pastikan:
- Tidak ada error di terminal
- Halaman menampilkan teks "Certifora — Coming Soon" dengan styling Tailwind (font bold, warna indigo)

---

## Kriteria Selesai

- [ ] Semua dependencies terinstall tanpa error
- [ ] Tailwind CSS v4 terkonfigurasi dan berfungsi
- [ ] File default dibersihkan
- [ ] `npm run dev` berjalan tanpa error
- [ ] Styling Tailwind terlihat di browser (teks berwarna indigo)
