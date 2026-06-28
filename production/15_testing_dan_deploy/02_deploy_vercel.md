# 02 — Deploy ke Vercel

> **Prasyarat:** Semua testing sudah dilakukan dan lulus (file `01_testing_checklist.md` sudah selesai).

---

## Tujuan

Melakukan deployment Certifora ke Vercel Hobby Plan (gratis permanen).

---

## Langkah-langkah

### 1. Push ke GitHub

Pastikan semua kode sudah di-commit dan push ke GitHub:

```bash
git add .
git commit -m "feat: complete Certifora implementation"
git push origin main
```

---

### 2. Daftar/Login Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub (gratis, tanpa kartu kredit)

---

### 3. Import Project

1. Klik **"Add New..."** → **"Project"**
2. Pilih repository `certifora` dari daftar GitHub repos
3. Vercel otomatis mendeteksi framework Vite

---

### 4. Konfigurasi Build

Pastikan pengaturan berikut:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

### 5. Environment Variables

Tambahkan environment variables di Vercel:

1. Di halaman import project, buka **"Environment Variables"**
2. Tambahkan:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |
| `VITE_APP_URL` | `https://certifora.vercel.app` | Production |
| `VITE_APP_URL` | URL preview deployment | Preview |

> **PENTING:** Jangan masukkan `SUPABASE_SERVICE_ROLE_KEY` atau `RESEND_API_KEY` di Vercel — itu hanya untuk Supabase Edge Function.

---

### 6. Deploy

Klik **"Deploy"**. Vercel akan:
1. Clone repo
2. Install dependencies
3. Build project
4. Deploy ke CDN global

Setelah selesai, Vercel memberikan URL: `https://certifora.vercel.app` (atau URL custom).

---

### 7. Konfigurasi Vercel untuk SPA Routing

Karena Certifora menggunakan React Router (client-side routing), perlu konfigurasi agar semua path di-handle oleh `index.html`.

Buat file `vercel.json` di root proyek:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit dan push:

```bash
git add vercel.json
git commit -m "chore: add Vercel SPA rewrite config"
git push origin main
```

Vercel akan otomatis redeploy.

---

### 8. Update VITE_APP_URL

Setelah deployment berhasil, update `VITE_APP_URL` di Vercel settings:
1. Buka project di Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Update `VITE_APP_URL` ke URL production yang sebenarnya

---

### 9. Test Production

Buka URL production dan verifikasi:

- [ ] Landing page tampil
- [ ] Login berfungsi
- [ ] Dashboard admin tampil setelah login
- [ ] Form registrasi via QR berfungsi
- [ ] Validasi sertifikat berfungsi
- [ ] Tidak ada error di console browser

---

### 10. Custom Domain (Opsional)

Jika punya domain sendiri:
1. Di Vercel Dashboard → **Settings** → **Domains**
2. Tambahkan domain custom
3. Ikuti instruksi DNS (CNAME atau A record)
4. HTTPS otomatis aktif

Jika tidak, `certifora.vercel.app` sudah cukup.

---

## Auto-Deploy

Setelah setup awal, setiap `git push` ke branch `main` akan otomatis trigger deployment baru di Vercel. Preview deployment juga otomatis dibuat untuk setiap pull request.

---

## Kriteria Selesai

- [ ] Repository sudah terhubung dengan Vercel
- [ ] Environment variables sudah diset
- [ ] Build berhasil tanpa error
- [ ] `vercel.json` sudah dibuat untuk SPA routing
- [ ] URL production bisa diakses
- [ ] Semua fitur berfungsi di production
- [ ] Auto-deploy aktif (push ke main = deploy otomatis)
