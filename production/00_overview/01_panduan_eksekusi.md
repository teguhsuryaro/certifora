# Panduan Eksekusi — Certifora Production Plan

> **PENTING:** Folder `production/` ini adalah panduan implementasi. JANGAN menghapus atau memodifikasi isinya saat proses implementasi berlangsung.

---

## Tentang Folder Production

Folder ini berisi seluruh perencanaan implementasi website **Certifora** — sebuah platform untuk membuat, mengelola, memvalidasi, dan mengirim sertifikat digital berbentuk PDF via email.

Setiap subfolder dinomori sesuai **urutan eksekusi**. Setiap file `.md` di dalam subfolder juga dinomori untuk urutan eksekusi internal.

---

## Urutan Eksekusi Folder

| No | Folder | Deskripsi | Estimasi |
|----|--------|-----------|----------|
| 00 | `00_overview` | Panduan eksekusi & arsitektur | Baca dulu |
| 01 | `01_project_setup` | Inisialisasi proyek, dependencies, konfigurasi | 1-2 jam |
| 02 | `02_supabase_setup` | Database, auth, storage, RLS, Edge Function | 2-3 jam |
| 03 | `03_auth_dan_routing` | Autentikasi superadmin, routing, layout | 2-3 jam |
| 04 | `04_design_system` | Komponen UI reusable, tema, Tailwind config | 3-4 jam |
| 05 | `05_fitur_event` | CRUD event, status management, QR code | 4-5 jam |
| 06 | `06_template_editor` | Upload template PDF, editor drag-and-drop | 5-6 jam |
| 07 | `07_registrasi_peserta` | Form registrasi publik, upload selfie, kompresi | 3-4 jam |
| 08 | `08_dashboard_peserta` | Tabel/card peserta, search, filter, detail | 4-5 jam |
| 09 | `09_generate_pdf` | Generate PDF sertifikat client-side dengan pdf-lib | 4-5 jam |
| 10 | `10_kirim_email` | Edge Function Resend, batching, progress | 4-5 jam |
| 11 | `11_validasi_sertifikat` | Halaman publik `/verify/:kode` | 1-2 jam |
| 12 | `12_export_data` | Export Excel dan PDF data peserta | 2-3 jam |
| 13 | `13_landing_page` | Landing page dan halaman publik lainnya | 2-3 jam |
| 14 | `14_github_actions` | Cron job keep-alive Supabase | 1 jam |
| 15 | `15_testing_dan_deploy` | Testing, deployment Vercel, final check | 3-4 jam |

**Total estimasi: 37-50 jam kerja**

---

## Aturan Implementasi

1. **Kerjakan folder secara berurutan** — folder berikutnya mungkin bergantung pada folder sebelumnya.
2. **Dalam satu folder, kerjakan file secara berurutan** — file `01_xxx.md` dikerjakan sebelum `02_xxx.md`.
3. **Jangan skip** — setiap file berisi bagian yang saling terhubung.
4. **Implementasi dilakukan di folder root proyek** (`e:\CODING\certifora\`), BUKAN di dalam folder `production/`.
5. **File spesifikasi (`spesifikasi.md`) dan folder `production/` tidak boleh dihapus/dimodifikasi** selama implementasi.
6. **Setiap file `.md` sudah self-contained** — berisi konteks, instruksi langkah demi langkah, kode yang harus ditulis, dan kriteria selesai.

---

## Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Backend & DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| PDF Generation | pdf-lib (client-side) |
| QR Code | qrcode (npm) |
| Email | Resend (via Supabase Edge Function) |
| Hosting | Vercel (Hobby Plan) |
| CI/CD | GitHub Actions |

---

## Environment Variables yang Dibutuhkan

```
# Frontend (.env di Vercel)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Supabase Edge Function
RESEND_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub Actions Secrets
SUPABASE_URL=
SUPABASE_ANON_KEY=
```
