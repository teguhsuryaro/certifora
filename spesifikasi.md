# Spesifikasi Website Certifora — Sertifikat Generator

> **Nama Produk:** Certifora
> **Status Dokumen:** Lengkap (Fungsional + Infrastruktur + UI/UX)
> **Prinsip Utama:** 100% gratis selamanya (no trial, no credit card, no paid tier) dari pembuatan sampai operasional jangka panjang.

---

## Tujuan

Website untuk membuat, mengelola, memvalidasi, dan mengirim sertifikat
digital berbentuk PDF melalui email dengan infrastruktur gratis.

---

# Target Penggunaan

- Target utama: 50 peserta/event.
- Target desain sistem: 200–300 peserta/event.
- Infrastruktur sebisa mungkin menggunakan layanan gratis.

---

# Role

## Superadmin

Superadmin memiliki akses penuh untuk:

- Membuat event
- Mengedit event
- Menutup sementara event
- Menutup permanen event
- Mengatur template sertifikat
- Mengelola peserta
- Melihat selfie peserta
- Melihat preview sertifikat
- Mengirim sertifikat
- Mengirim ulang sertifikat
- Export data peserta ke Excel
- Export data peserta ke PDF

Tidak ada fitur menghapus event. Event hanya dapat diubah statusnya.

---

# Alur Sistem

## 1. Membuat Event

Saat membuat event, superadmin mengisi:

### Informasi Event

- Nama event
- Deskripsi
- Penyelenggara
- Lokasi (opsional)
- Tanggal
- Waktu

### Pengaturan Email

- Subject email
- Judul email
- Isi email

### Template Sertifikat

Upload 1 file PDF sebagai template.

Ketentuan:

- 1 event hanya memiliki 1 template aktif.
- Template dapat diganti kapan saja.
- Saat template diganti, pengaturan tata letak diatur ulang.

---

## 2. Pengaturan Template

Superadmin dapat mengatur:

### Nama Peserta

- Posisi bebas (drag)
- Ukuran font
- Warna font
- Font
- Format:
  - Original
  - UPPERCASE
  - lowercase
  - Title Case

Font disediakan oleh sistem (gratis).

### QR Sertifikat

Posisi dapat dipilih:

- Pojok kiri atas
- Pojok kanan atas
- Pojok kiri bawah
- Pojok kanan bawah

---

## 3. QR Code Event

Setelah event dibuat sistem membuat QR Code.

QR mengarah ke halaman registrasi peserta.

QR hanya aktif apabila status event = Aktif.

---

# Status Event

- Draft
- Aktif
- Ditutup Sementara
- Ditutup Permanen

Perbedaan:

## Aktif

Peserta dapat mengakses QR.

## Ditutup Sementara

QR tidak dapat diakses. Event masih dapat dibuka kembali.

## Ditutup Permanen

QR tidak dapat diakses. Tidak dapat dibuka kembali.

Namun seluruh data event dan validasi sertifikat tetap tersedia.

Event tidak pernah dihapus.

---

# Form Peserta

Peserta mengisi:

- Nama lengkap
- Email
- Foto selfie

Ketentuan selfie:

- JPG/JPEG/PNG
- Maksimal unggahan 5 MB
- Sistem otomatis mengompresi gambar sebelum disimpan agar penggunaan
  storage tetap hemat.
- Selfie wajib diisi.

Sebelum submit ditampilkan peringatan:

> Pastikan nama sesuai identitas asli. Nama pada sertifikat akan
> mengikuti data yang Anda masukkan.

---

# Dashboard Peserta

Dalam setiap event terdapat tabel peserta.

Kolom:

- Nama
- Email
- Selfie
- Preview Sertifikat
- Status Pengiriman
- Kode Sertifikat
- Tanggal Submit
- Aksi

---

# Selfie

Superadmin dapat membuka selfie untuk validasi.

---

# Preview Sertifikat

Preview hanyalah simulasi.

Belum menghasilkan PDF.

Pada preview superadmin dapat melakukan override khusus peserta
tersebut:

- Geser posisi nama
- Perbesar/perkecil ukuran font

Perubahan hanya berlaku untuk peserta tersebut.

Template utama tidak berubah.

---

# Kode Sertifikat

Setiap peserta memperoleh kode unik.

Contoh:

WEBINARAI-7729

Format:

`<PREFIX EVENT>-<4 ANGKA ACAK>`

Prefix ditentukan saat membuat event.

Kode ini digunakan sebagai identitas sertifikat.

---

# Pengiriman Sertifikat

Per peserta:

- Preview
- Konfirmasi
- Generate PDF
- Kirim email

Tersedia juga tombol:

## Kirim Semua

Mengirim seluruh peserta yang belum terkirim.

Status:

- Belum dikirim
- Berhasil
- Gagal

Jika gagal tersedia tombol Kirim Ulang.

PDF tidak disimpan permanen untuk menghemat storage. PDF dibuat saat
proses pengiriman.

---

# Validasi Sertifikat

QR pada sertifikat mengarah ke halaman validasi.

URL menggunakan Kode Sertifikat.

Contoh:

/verify/WEBINARAI-7729

Halaman menampilkan:

- Status: Sertifikat Valid
- Nama peserta
- Nama event
- Penyelenggara
- Tanggal event
- Kode sertifikat

Halaman validasi tetap aktif meskipun event telah ditutup.

---

# Export

Per event:

- Export Excel
- Export PDF

Berisi seluruh data peserta dan status pengiriman.

---

# Catatan Desain (Fungsional)

- Tidak menggunakan AI.
- Tidak menggunakan OCR.
- Tidak menggunakan face recognition.
- Tidak menyimpan PDF permanen.
- Menyimpan hanya data peserta, metadata, dan pengaturan event.
- Fokus pada kesederhanaan, performa, dan infrastruktur gratis.

---
---

# BAGIAN A — SPESIFIKASI INFRASTRUKTUR (LENGKAP)

> Semua layanan di bawah dipilih dengan kriteria **wajib**: free tier permanen, **bukan** trial berbatas waktu, **tidak** memerlukan kartu kredit untuk fitur yang dipakai, dan cukup untuk skala 50–300 peserta/event.

## A.1 Ringkasan Stack

| Layer | Layanan | Tier | Kartu Kredit? |
|---|---|---|---|
| Frontend hosting | **Vercel** (Hobby) | Gratis permanen | Tidak |
| Frontend framework | React 18 + Vite + TypeScript | Open source | - |
| Styling | Tailwind CSS | Open source | - |
| State management | Zustand | Open source | - |
| Backend / Database | **Supabase** (Free Plan) | Gratis permanen | Tidak |
| Auth | Supabase Auth (email/password) | Gratis permanen | Tidak |
| Storage (selfie, template PDF) | Supabase Storage | Gratis permanen | Tidak |
| Generate PDF sertifikat | **pdf-lib** (client-side, di browser) | Open source, gratis selamanya | - |
| QR Code generation | `qrcode` (npm, client-side) | Open source | - |
| Kirim email | **Resend** (Free Plan) | Gratis permanen | Tidak |
| Cron job (anti-pause Supabase) | **GitHub Actions** (scheduled workflow) | Gratis (public repo) | Tidak |
| Domain | Subdomain `vercel.app` (gratis) ATAU domain gratis opsional | Gratis | Tidak |
| Version control | GitHub | Gratis | Tidak |

**Total biaya: Rp 0 — selamanya**, sepanjang penggunaan tetap dalam batas free tier (lihat A.7 untuk detail kuota).

---

## A.2 Frontend — Vercel + React/Vite

### Setup
- Repo GitHub (public atau private, keduanya gratis di akun personal).
- Project di-deploy ke **Vercel Hobby Plan**.
- Auto-deploy setiap push ke branch `main`.
- Preview deployment otomatis untuk setiap pull request (gratis, bawaan Vercel).

### Kuota Vercel Hobby (gratis permanen)
- 100 GB bandwidth/bulan.
- Build tak terbatas (dengan fair-use limit waktu build).
- Custom domain gratis (boleh pakai domain sendiri jika ada, atau cukup `certifora.vercel.app`).
- HTTPS otomatis (SSL gratis bawaan).

### Catatan Penting
- Vercel Hobby **dilarang untuk tujuan komersial** menurut ToS mereka. Karena Certifora kemungkinan dipakai untuk event organisasi/kampus yang non-komersial, ini aman. Jika nanti dipakai untuk keperluan komersial (jual jasa generate sertifikat berbayar ke klien), perlu evaluasi ulang ke Vercel Pro (berbayar) — di luar lingkup spesifikasi ini karena prinsip kita 100% gratis.

---

## A.3 Backend & Database — Supabase Free Plan

### Mengapa Supabase
- PostgreSQL penuh (bukan versi terbatas).
- Auth bawaan (email/password, cukup untuk 1 akun superadmin).
- Storage bawaan untuk file (selfie, template PDF).
- Row Level Security (RLS) untuk keamanan data.
- Realtime opsional (tidak wajib dipakai di Certifora, tapi tersedia gratis).

### Kuota Supabase Free Plan (per project)
- Database: 500 MB.
- Storage file: 1 GB.
- Bandwidth: 5 GB/bulan.
- Monthly Active Users (Auth): 50.000 (jauh lebih dari cukup, karena hanya 1 superadmin yang login).
- Maksimal 2 organisasi gratis aktif, tiap organisasi bisa punya beberapa project gratis (cek dashboard saat dibuat, kuota bisa berubah — selalu verifikasi di [supabase.com/pricing](https://supabase.com/pricing) saat eksekusi).
- **Auto-pause**: project free tier akan di-pause otomatis jika tidak ada request API selama **7 hari berturut-turut**. Ini yang diatasi dengan cron job (lihat A.6).

### Skema Tabel (9 tabel, disesuaikan dari proyek "Transportasi" yang familiar bagi Surya — pola JOIN antar tabel relasional)

```
1. admins              -- data superadmin (terhubung ke Supabase Auth)
2. events               -- data event
3. event_email_settings -- subject, judul, isi email per event
4. certificate_templates -- file template PDF + metadata layout per event
5. template_overrides   -- override posisi/font khusus per peserta
6. participants         -- data peserta (nama, email, selfie_url, kode_sertifikat)
7. delivery_logs         -- riwayat status pengiriman per peserta (belum/berhasil/gagal)
8. certificate_codes     -- index kode sertifikat unik (untuk validasi cepat & cegah duplikat)
9. event_status_history  -- log perubahan status event (audit trail sederhana)
```

Relasi inti: `events` 1—N `participants`, `events` 1—1 `certificate_templates`, `participants` 1—N `delivery_logs`, `participants` 1—1 `template_overrides` (opsional), `events` 1—1 `event_email_settings`.

### Row Level Security (RLS)
- Tabel admin-only (`events`, `participants`, dll.) → hanya bisa diakses oleh role `authenticated` yang merupakan superadmin.
- Tabel publik terbatas:
  - Insert ke `participants` (form registrasi) → dibuka untuk `anon`, **tapi hanya jika event berstatus Aktif** (dicek via RLS policy yang membaca status event).
  - Select ke halaman `/verify/:kode` → dibuka untuk `anon`, read-only, hanya kolom yang relevan untuk validasi.

### Storage Buckets
```
- selfies/          -- foto selfie peserta (private, hanya superadmin & via signed URL)
- certificate-templates/  -- file PDF template (private, hanya superadmin)
```
Selfie dikompresi di sisi client (browser) sebelum upload, sehingga ukuran file kecil dan kuota 1 GB storage cukup untuk ribuan peserta.

---

## A.4 Generate PDF Sertifikat — Client-Side dengan pdf-lib

Sesuai keputusan: generate PDF dilakukan **di browser**, bukan di server.

### Alasan
- Tidak ada biaya compute server.
- Tidak terbatas oleh kuota Edge Function invocation Supabase.
- Library `pdf-lib` open source, jalan penuh di browser (JavaScript), gratis selamanya, tidak ada API call ke pihak ketiga.

### Alur Teknis
1. Superadmin/sistem mengambil file template PDF dari Supabase Storage.
2. `pdf-lib` membuka PDF tersebut sebagai dokumen yang bisa diedit.
3. Teks nama peserta digambar (`drawText`) di posisi X/Y yang sudah diatur saat Pengaturan Template (atau override khusus peserta).
4. QR Code (dibuat dengan library `qrcode`, hasilnya berupa data URL/PNG) digambar (`drawImage`) di posisi pojok yang dipilih.
5. PDF hasil di-export sebagai `Uint8Array` / `Blob`, langsung dilampirkan sebagai attachment ke email (lihat A.5) — **tidak pernah disimpan ke Storage**, sesuai catatan desain "PDF tidak disimpan permanen".

### Library Pendukung
```
pdf-lib       — manipulasi PDF
qrcode        — generate QR code sebagai image
fontkit (opsional, dibundel pdf-lib) — embed font custom ke PDF
```

### Font Sistem
Karena pdf-lib butuh file font (`.ttf`) untuk embed teks kustom, sistem menyediakan beberapa font gratis berlisensi open (misal **Google Fonts**: Inter, Poppins, Montserrat, Playfair Display, Roboto) yang di-bundle langsung ke dalam aset frontend (`/public/fonts/`). Tidak ada API key atau biaya, karena Google Fonts open source dan boleh self-host.

---

## A.5 Kirim Email — Resend (Free Plan)

### Kuota Resend Free Plan
- 100 email/hari.
- 3.000 email/bulan.
- 1 domain custom terverifikasi (opsional — bisa juga pakai domain default Resend untuk testing, namun **disarankan verifikasi domain sendiri** agar deliverability bagus dan tidak masuk folder spam).

### Perhitungan Kecukupan Kuota
- Target desain sistem: 200–300 peserta/event.
- Jika 1 event = 300 peserta, dan pengiriman dilakukan bertahap (tidak harus 1 hari), kuota 100/hari tetap cukup — perlu strategi **batching pengiriman** (lihat di bawah).
- Jika butuh kirim 300 email dalam 1 hari, itu melebihi limit harian (100/hari). Maka tombol "Kirim Semua" perlu logic:
  - Kirim maksimal sejumlah sisa kuota harian yang aman (disarankan batas internal 90/hari, sisakan buffer 10).
  - Sisanya otomatis masuk antrian "Belum Dikirim" dan bisa dilanjutkan keesokan harinya dengan tombol "Kirim Semua" lagi (status sisanya tetap "Belum dikirim", bukan "Gagal").
  - Tampilkan notifikasi: *"Hari ini terkirim X dari Y peserta. Sisanya akan otomatis tersedia untuk dikirim besok karena keterbatasan kuota email harian gratis."*

### Integrasi Teknis
- Resend dipanggil dari **Supabase Edge Function** (bukan langsung dari browser), karena:
  - API Key Resend tidak boleh terekspos di client-side.
  - Edge Function menerima PDF (sebagai base64/Blob dari hasil generate client-side) + data tujuan, lalu mengirim via Resend API.
- Edge Function di Supabase **gratis** hingga 500.000 invocation/bulan pada free plan — jauh melebihi kebutuhan.

### Format Email
- Subject, Judul, dan Isi email diambil dari pengaturan event (`event_email_settings`).
- PDF sertifikat dilampirkan sebagai attachment.
- Template email HTML sederhana dan rapi (lihat Bagian B — UI/UX, bagian Email Template).

---

## A.6 Cron Job — Mencegah Auto-Pause Supabase via GitHub Actions

### Masalah
Supabase Free Plan akan **otomatis pause project** jika tidak ada aktivitas (API request) selama 7 hari berturut-turut. Jika project ter-pause, website tidak bisa mengakses database sampai di-resume manual dari dashboard Supabase.

### Solusi: GitHub Actions Scheduled Workflow

Dibuat sebuah **GitHub Actions workflow** terjadwal (`cron`) yang berjalan **3 kali per minggu** (misal Senin, Rabu, Jumat) untuk melakukan request sederhana (misal `SELECT` ringan ke salah satu tabel, atau panggil endpoint Supabase REST API) — cukup untuk dianggap sebagai "aktivitas" oleh Supabase sehingga auto-pause tidak terpicu.

### File Workflow (contoh struktur)

```yaml
# .github/workflows/keep-supabase-alive.yml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 3 * * 1,3,5'  # Senin, Rabu, Jumat, jam 03:00 UTC
  workflow_dispatch:          # bisa dijalankan manual juga

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST API
        run: |
          curl -X GET \
            "${{ secrets.SUPABASE_URL }}/rest/v1/events?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Catatan Implementasi
- `SUPABASE_URL` dan `SUPABASE_ANON_KEY` disimpan sebagai **GitHub Repository Secrets** (gratis, aman, tidak terekspos di kode).
- Endpoint yang dipanggil cukup `SELECT` ringan (misal ambil 1 baris dari tabel `events`) — bukan operasi tulis, supaya tidak mengubah data secara tidak sengaja.
- GitHub Actions **gratis 2.000 menit/bulan** untuk akun personal pada repository privat (dan **tak terbatas** untuk repository publik) — jauh lebih dari cukup untuk job ringan 3x/minggu yang hanya berjalan beberapa detik.
- `workflow_dispatch` ditambahkan agar Surya juga bisa trigger manual dari tab Actions di GitHub jika sewaktu-waktu ingin memastikan project tetap aktif tanpa menunggu jadwal cron.

### Redundansi (opsional, tidak wajib)
Jika suatu saat GitHub Actions gagal berjalan (misal karena repo tidak ada commit dalam waktu lama, yang **bisa** membuat scheduled workflow di-disable otomatis oleh GitHub setelah 60 hari tanpa aktivitas repo), solusi cadangan:
- Lakukan minimal 1 commit kecil (misal update README) setiap beberapa minggu untuk menjaga repo "aktif", **atau**
- Tambahkan workflow kedua yang melakukan commit otomatis kecil (misal update timestamp di file `LAST_PING.md`) setiap kali cron berjalan — ini sekaligus menjaga repo tetap "aktif" dan mencegah GitHub mendisable scheduled workflow.

```yaml
      - name: Update ping timestamp (keep repo active)
        run: |
          echo "Last ping: $(date -u)" > LAST_PING.md
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add LAST_PING.md
          git commit -m "chore: keep-alive ping $(date -u +%Y-%m-%d)" || echo "No changes"
          git push
```

---

## A.7 Ringkasan Batas Kuota Gratis (Wajib Dipantau)

| Layanan | Limit Free Tier | Risiko jika terlampaui |
|---|---|---|
| Vercel | 100 GB bandwidth/bulan | Deploy diblokir sementara sampai bulan berikutnya |
| Supabase DB | 500 MB | Perlu cleanup data lama / upgrade |
| Supabase Storage | 1 GB | Selfie tidak bisa diupload lagi |
| Supabase Bandwidth | 5 GB/bulan | Request API gagal sementara |
| Supabase Edge Function | 500.000 invocation/bulan | Pengiriman email gagal sementara |
| Resend | 100 email/hari, 3.000/bulan | Kirim sertifikat tertunda, masuk antrian |
| GitHub Actions | 2.000 menit/bulan (privat) / unlimited (publik) | Cron job berhenti jalan |

> **Rekomendasi:** Karena target sistem hanya 200–300 peserta/event dan asumsi tidak banyak event berjalan simultan, seluruh kuota di atas **sangat aman** dan tidak akan terlampaui dalam pemakaian normal.

---

## A.8 Environment Variables yang Dibutuhkan

```
# Frontend (Vercel)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Supabase Edge Function (kirim email)
RESEND_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # hanya dipakai di server-side Edge Function, JANGAN di frontend

# GitHub Actions Secrets
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---
---

# BAGIAN B — SPESIFIKASI UI/UX

## B.1 Prinsip Desain

1. **Mobile-first, fully responsive** — mayoritas peserta event kemungkinan mengisi form registrasi dari HP (scan QR code di lokasi acara), sementara superadmin lebih sering mengelola dari laptop/desktop. Maka:
   - **Halaman peserta** (registrasi, validasi) → didesain mobile-first, lalu diperluas ke tablet/desktop.
   - **Dashboard superadmin** → didesain desktop-first (karena kompleksitas tabel & pengaturan template), namun tetap harus *usable* di tablet, dan minimal *readable* di mobile (dengan layout yang menyesuaikan, misal tabel jadi card-list di layar kecil).
2. **Clarity over decoration** — superadmin sering kerja cepat saat hari-H event (banyak peserta daftar bersamaan), maka UI harus minim friksi: status jelas, aksi jelas, tidak ada langkah tersembunyi.
3. **Feedback eksplisit di setiap aksi penting** — generate PDF, kirim email, upload selfie, semua butuh loading state & konfirmasi sukses/gagal yang jelas (karena prosesnya tidak instan dan melibatkan banyak tahap di belakang layar).
4. **Skema warna**: Dipilih sementara palet *neutral-professional* dengan satu accent color sebagai placeholder (kemungkinan akan diganti nanti oleh Surya):
   - Primary accent: `#4F46E5` (indigo) — dipakai untuk CTA utama, status aktif.
   - Neutral base: skala abu-abu (`#F9FAFB` hingga `#111827`) untuk background & teks.
   - Status colors: hijau (`#10B981`) untuk "Berhasil"/"Aktif", kuning (`#F59E0B`) untuk "Belum dikirim"/"Draft", merah (`#EF4444`) untuk "Gagal"/"Ditutup Permanen", abu (`#6B7280`) untuk "Ditutup Sementara".
   - *(Catatan: warna ini hanya placeholder fungsional, struktur komponen sudah dibuat agar mudah re-theme via Tailwind config tanpa refactor besar.)*

---

## B.2 Peta Halaman (Sitemap)

### Area Publik (tanpa login)
```
/                          → Landing page singkat Certifora (opsional, bisa redirect ke login)
/login                     → Login superadmin
/event/:eventId/register   → Form registrasi peserta (diakses via QR code)
/event/:eventId/closed     → Halaman info jika event tidak aktif/ditutup
/verify/:kodeSertifikat    → Halaman validasi sertifikat (publik, selalu aktif)
```

### Area Superadmin (login wajib)
```
/admin/dashboard                       → Daftar semua event
/admin/events/new                      → Form buat event baru
/admin/events/:eventId                 → Detail event (overview + status)
/admin/events/:eventId/template        → Editor pengaturan template sertifikat
/admin/events/:eventId/participants    → Dashboard tabel peserta
/admin/events/:eventId/participants/:id → Detail peserta (selfie, preview, kirim individual)
/admin/events/:eventId/export          → Halaman export Excel/PDF
```

---

## B.3 Wireframe & UX per Halaman Kunci

### B.3.1 Form Registrasi Peserta (Mobile-First)

**Konteks penggunaan:** Peserta scan QR code dari HP saat acara berlangsung — koneksi mungkin lambat, layar kecil, kondisi buru-buru.

Struktur halaman (urut dari atas):
1. **Header event** — nama event, tanggal, penyelenggara (ringkas, agar peserta yakin sudah scan QR yang benar).
2. **Form input:**
   - Nama lengkap (text input, autofocus saat halaman dibuka).
   - Email (input type email, validasi format real-time).
   - Upload selfie:
     - Tombol besar dengan ikon kamera, label "Ambil/Upload Selfie".
     - Di mobile, otomatis membuka opsi kamera langsung (`<input type="file" accept="image/*" capture="user">`) atau pilih dari galeri.
     - Preview thumbnail setelah dipilih, dengan tombol "Ganti Foto".
     - Indikator kompresi otomatis berjalan (misal teks kecil: "Memproses gambar...") sebelum tombol submit aktif.
3. **Peringatan penting** ditampilkan sebagai *callout box* (warna kuning lembut, ikon peringatan) tepat sebelum tombol submit:
   > "Pastikan nama sesuai identitas asli. Nama pada sertifikat akan mengikuti data yang Anda masukkan."
4. **Tombol submit** — full-width di mobile, disabled sampai semua field valid, menampilkan spinner loading saat proses upload+compress berjalan.
5. **State sukses** — setelah submit berhasil, tampilkan halaman konfirmasi sederhana: "Pendaftaran berhasil! Sertifikat akan dikirim ke email Anda setelah event berlangsung." beserta ringkasan data yang diinput (agar peserta bisa cek ulang).

**UX detail tambahan:**
- Jika event berstatus tidak Aktif, halaman registrasi otomatis redirect ke `/event/:id/closed` dengan pesan yang sesuai (misal "Registrasi untuk event ini sudah ditutup").
- Validasi email format dan ukuran file dilakukan inline (real-time), bukan baru muncul setelah klik submit, untuk mengurangi rasa frustrasi di mobile.

---

### B.3.2 Dashboard Superadmin — Daftar Event

**Layout desktop:** Grid card atau table, dengan filter cepat berdasarkan status (Semua / Draft / Aktif / Ditutup Sementara / Ditutup Permanen).

Setiap card/row event menampilkan:
- Nama event + badge status berwarna (sesuai skema warna di B.1).
- Tanggal event.
- Jumlah peserta terdaftar (misal "127 peserta").
- Ringkasan status pengiriman (misal "98 terkirim / 29 belum").
- Tombol aksi cepat: "Kelola", "Lihat QR".

**Layout mobile:** Card list vertikal (1 kolom), informasi yang sama namun disusun stacked agar tetap terbaca tanpa scroll horizontal.

**Tombol utama:** "+ Buat Event Baru" — selalu terlihat (sticky di mobile sebagai floating action button, di pojok kanan bawah).

---

### B.3.3 Editor Pengaturan Template Sertifikat

Ini adalah halaman paling kompleks secara interaksi, didesain **desktop-first** (drag-and-drop teks di atas kanvas PDF butuh presisi mouse), namun tetap diberi notice di mobile.

**Layout desktop (2 kolom):**
- **Kolom kiri (kanvas, ~70% lebar):** Preview visual template PDF yang sudah diupload, dengan elemen "Nama Peserta" dan "QR Code" sebagai object yang bisa di-drag langsung di atas kanvas (real-time, menggunakan library seperti `react-draggable` atau `react-moveable`, dirender di atas `<canvas>` atau gambar preview PDF).
- **Kolom kanan (panel kontrol, ~30% lebar), berisi tab/section:**
  - **Tab "Nama Peserta":** dropdown font, slider/input ukuran font, color picker warna, dropdown format teks (Original/UPPERCASE/lowercase/Title Case) — dengan live preview langsung ter-update di kanvas kiri saat diubah.
  - **Tab "QR Code":** pilihan 4 posisi pojok (ditampilkan sebagai 4 tombol kotak dengan ikon visual posisi, bukan dropdown teks — lebih cepat dipahami).
- **Tombol "Simpan Pengaturan"** — sticky di bagian bawah panel kanan, selalu terlihat tanpa perlu scroll.
- **Tombol "Ganti Template PDF"** — di bagian atas, dengan dialog konfirmasi yang menjelaskan konsekuensi: "Mengganti template akan mengatur ulang posisi nama dan QR code. Lanjutkan?"

**Layout mobile/tablet kecil:**
- Kanvas preview tetap ditampilkan (read-only/lebih sulit drag presisi di touch screen), namun kontrol diubah jadi input numerik (X, Y dalam persen/pixel) sebagai alternatif drag, supaya tetap bisa dipakai meski kurang ideal. Ditambahkan notice halus: "Untuk pengalaman terbaik mengatur posisi, gunakan desktop/laptop."

---

### B.3.4 Dashboard Peserta (Tabel)

**Desktop:** Table standar dengan kolom sesuai spesifikasi (Nama, Email, Selfie, Preview Sertifikat, Status Pengiriman, Kode Sertifikat, Tanggal Submit, Aksi).
- Kolom "Selfie" menampilkan thumbnail kecil bulat (avatar-style), klik untuk membuka modal ukuran penuh.
- Kolom "Status Pengiriman" menampilkan badge warna (Belum dikirim/Berhasil/Gagal).
- Kolom "Aksi" berisi ikon: Preview, Kirim/Kirim Ulang.
- Header tabel sticky saat scroll (penting jika peserta 200–300 orang).
- Search bar (cari nama/email) + filter status di atas tabel.
- Checkbox bulk-select opsional untuk kirim massal ke peserta tertentu (selain tombol "Kirim Semua" global).

**Mobile:** Table berubah jadi **card list** — setiap peserta jadi 1 card berisi nama, email, status badge, dan tombol aksi (preview/kirim) dalam layout vertikal ringkas. Selfie ditampilkan sebagai avatar kecil di pojok card.

**Tombol "Kirim Semua":**
- Ditampilkan prominent di atas tabel.
- Saat diklik, muncul modal konfirmasi menampilkan ringkasan: "Akan mengirim sertifikat ke 87 peserta yang belum terkirim. Estimasi waktu: ~2 menit." (mengingat proses generate PDF client-side + kirim satu per satu).
- Progress bar real-time saat proses berjalan ("Mengirim 23 dari 87...").
- Jika kena limit harian Resend (lihat A.5), modal otomatis menampilkan pesan jelas alih-alih generic error.

---

### B.3.5 Halaman Validasi Sertifikat (`/verify/:kode`)

**Didesain mobile-first** karena biasanya diakses dengan scan QR dari sertifikat fisik/digital menggunakan kamera HP.

Layout sederhana, terpusat (centered card):
- Ikon/badge besar status: ✅ "Sertifikat Valid" (hijau) jika kode ditemukan, atau ❌ "Sertifikat Tidak Ditemukan" (merah) jika kode tidak valid/tidak ada.
- Detail tersusun sebagai list rapi:
  - Nama peserta
  - Nama event
  - Penyelenggara
  - Tanggal event
  - Kode sertifikat (ditampilkan dengan font monospace agar mudah dibaca/dicocokkan)
- Tidak ada navigasi rumit — halaman ini berdiri sendiri, fokus untuk dibuka sekali, dibaca, selesai.
- Footer kecil bertuliskan "Diverifikasi oleh Certifora" sebagai branding halus.

---

## B.4 Komponen UI yang Dipakai Berulang (Design System Ringan)

Untuk konsistensi dan mempermudah ganti warna nanti (sesuai rencana Surya), seluruh komponen berikut dibangun sebagai komponen reusable dengan Tailwind config terpusat (`tailwind.config.js` dengan custom color tokens, bukan hardcoded hex di tiap komponen):

```
- StatusBadge        → badge warna untuk status event & status pengiriman
- Button (primary/secondary/danger/ghost)
- Modal (konfirmasi, preview, error)
- Table (desktop) / CardList (mobile) — 1 komponen data yang render berbeda sesuai breakpoint
- FileUploadBox       → dipakai untuk upload template PDF & selfie
- ProgressBar         → untuk proses kirim semua
- ColorPicker, FontSelector, PositionPicker (4 corner) → dipakai khusus di editor template
- EmptyState          → tampilan saat belum ada event/peserta
- LoadingSpinner / Skeleton → state loading konsisten di semua halaman
```

## B.5 Responsive Breakpoints (Tailwind default, dipakai konsisten)

```
sm:  640px   → mobile besar / mulai ada sedikit ruang ekstra
md:  768px   → tablet
lg:  1024px  → laptop kecil / mulai layout desktop penuh (sidebar admin muncul)
xl:  1280px  → desktop standar
```

Dashboard superadmin menggunakan sidebar navigasi yang collapse menjadi bottom navigation bar atau hamburger menu di bawah breakpoint `lg`.

## B.6 Template Email (HTML sederhana)

Email yang dikirim via Resend menggunakan template HTML minimal namun rapi:
- Header dengan judul email (dari pengaturan event).
- Isi email (dari pengaturan event), ditampilkan sebagai paragraf biasa.
- Lampiran PDF sertifikat (attachment, bukan inline).
- Footer kecil: nama event, penyelenggara, dan catatan "Email ini dikirim otomatis melalui Certifora."
- Desain responsive email (lebar maksimal 600px, font sistem standar agar tampil konsisten di Gmail/Outlook/Apple Mail).

---
---

# BAGIAN C — Catatan Desain (Gabungan, Final)

- Tidak menggunakan AI, OCR, atau face recognition.
- Tidak menyimpan PDF sertifikat secara permanen — dibuat saat pengiriman (client-side, via `pdf-lib`), langsung dikirim sebagai attachment, lalu dibuang dari memory.
- Hanya menyimpan: data peserta, metadata event, pengaturan template, dan log status pengiriman.
- Seluruh infrastruktur menggunakan layanan **free tier permanen** (bukan trial): Vercel, Supabase, Resend, GitHub Actions — total biaya Rp 0, termasuk untuk operasional jangka panjang, dengan mitigasi auto-pause Supabase melalui scheduled GitHub Actions workflow 3x/minggu.
- UI/UX dirancang responsif penuh: mobile-first untuk halaman peserta (registrasi, validasi), desktop-first namun tetap usable di mobile untuk dashboard superadmin.
- Skema warna saat ini adalah placeholder fungsional (indigo + neutral + status colors), disusun via Tailwind config terpusat agar mudah diganti total di akhir tanpa refactor besar.
- Fokus pembangunan awal: **sistem berjalan benar secara fungsional dan infrastruktur stabil di tingkat gratis**, sebelum penyempurnaan visual/branding final.