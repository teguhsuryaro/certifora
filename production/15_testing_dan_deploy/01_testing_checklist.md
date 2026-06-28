# 01 — Testing Fungsional End-to-End

> **Prasyarat:** Semua fitur sudah diimplementasi (folder 01–14 selesai).

---

## Tujuan

Melakukan testing menyeluruh semua fitur Certifora sebelum deployment, memastikan seluruh alur berjalan dengan benar.

---

## Checklist Testing

### A. Auth & Navigasi

- [ ] **Login berhasil** — masukkan email/password admin → redirect ke dashboard
- [ ] **Login gagal** — email/password salah → error message tampil
- [ ] **Logout** — klik "Keluar" → redirect ke login
- [ ] **Protected routes** — akses `/admin/dashboard` tanpa login → redirect ke login
- [ ] **Public routes** — akses `/`, `/verify/xxx` tanpa login → halaman tampil
- [ ] **404** — akses URL yang tidak ada → halaman 404 tampil

---

### B. Event Management

- [ ] **Buat event baru** — isi form lengkap → event tersimpan dengan status Draft
- [ ] **Detail event** — buka event → info lengkap tampil
- [ ] **Aktivasi event** — klik "Aktifkan Event" → status berubah ke Aktif, QR code tampil
- [ ] **QR Code** — scan QR code → membuka halaman registrasi
- [ ] **Salin link** — klik "Salin Link" → URL tersalin ke clipboard
- [ ] **Unduh QR** — klik "Unduh QR" → file PNG terunduh
- [ ] **Tutup sementara** — status berubah, QR tidak bisa diakses, bisa dibuka kembali
- [ ] **Tutup permanen** — status berubah, tidak bisa dibuka kembali, validasi tetap aktif

---

### C. Template Editor

- [ ] **Upload template PDF** — file terupload ke Supabase Storage
- [ ] **Preview PDF** — template tampil sebagai gambar di kanvas
- [ ] **Drag nama** — teks nama bisa di-drag di atas preview
- [ ] **Ubah font** — dropdown font bekerja, preview berubah
- [ ] **Ubah ukuran** — slider/input ukuran bekerja, preview berubah
- [ ] **Ubah warna** — color picker bekerja, preview berubah
- [ ] **Ubah format** — dropdown format (UPPERCASE, dll) bekerja
- [ ] **Ubah posisi QR** — 4 tombol pojok bekerja, preview berubah
- [ ] **Simpan pengaturan** — data tersimpan ke database, pesan sukses tampil
- [ ] **Ganti template** — upload baru berhasil, posisi di-reset

---

### D. Registrasi Peserta

- [ ] **Buka via QR** — halaman registrasi tampil di mobile
- [ ] **Event header** — nama event, tanggal, penyelenggara tampil
- [ ] **Isi form** — nama, email, selfie bisa diisi
- [ ] **Validasi inline** — error muncul real-time jika field kosong/invalid
- [ ] **Selfie kompresi** — indikator "Memproses gambar..." tampil, gambar terkompresi
- [ ] **Peringatan nama** — callout box kuning tampil sebelum submit
- [ ] **Submit berhasil** — halaman sukses tampil dengan ringkasan data + kode sertifikat
- [ ] **Event tidak aktif** — redirect ke halaman "Registrasi Ditutup"
- [ ] **Data tersimpan** — cek di Supabase: `participants` + `certificate_codes` + `selfies` bucket

---

### E. Dashboard Peserta

- [ ] **Tabel desktop** — semua kolom tampil (nama, email, selfie, status, kode, tanggal, aksi)
- [ ] **Card mobile** — card list tampil di layar kecil
- [ ] **Search** — cari nama/email/kode berfungsi
- [ ] **Filter status** — filter Belum/Berhasil/Gagal berfungsi
- [ ] **Detail peserta** — klik → halaman detail tampil
- [ ] **Selfie modal** — klik selfie thumbnail → modal ukuran penuh
- [ ] **Override** — atur posisi/font khusus per peserta, simpan berfungsi

---

### F. Generate & Kirim Sertifikat

- [ ] **Kirim individual** — klik "Kirim Sertifikat" di detail peserta → PDF di-generate → email terkirim
- [ ] **Status update** — status peserta berubah ke "Berhasil"
- [ ] **Delivery log** — riwayat pengiriman tercatat
- [ ] **Kirim ulang** — untuk peserta gagal, tombol "Kirim Ulang" berfungsi
- [ ] **Kirim semua** — klik "Kirim Semua" → modal konfirmasi → progress bar → email terkirim satu per satu
- [ ] **Limit harian** — setelah 90 email, pesan limit tampil dengan penjelasan
- [ ] **PDF generated** — PDF berisi nama peserta di posisi yang benar + QR code di pojok yang benar

---

### G. Validasi Sertifikat

- [ ] **Kode valid** — buka `/verify/KODE-VALID` → tampil "Sertifikat Valid" + detail
- [ ] **Kode invalid** — buka `/verify/KODE-PALSU` → tampil "Sertifikat Tidak Ditemukan"
- [ ] **Event ditutup** — validasi tetap berfungsi meskipun event ditutup permanen
- [ ] **QR di sertifikat** — scan QR pada PDF sertifikat → halaman validasi terbuka

---

### H. Export Data

- [ ] **Export Excel** — file `.xlsx` terunduh, berisi data lengkap peserta
- [ ] **Export PDF** — halaman tabel terbuka di tab baru, bisa di-print/save as PDF
- [ ] **Data lengkap** — semua kolom (no, nama, email, kode, status, tanggal) ada

---

### I. Landing Page

- [ ] **Tampilan** — hero, fitur, cara kerja, CTA, footer tampil dengan benar
- [ ] **Responsive** — layout menyesuaikan di mobile, tablet, desktop
- [ ] **Link** — "Masuk Admin" dan "Mulai Sekarang" mengarah ke `/login`
- [ ] **Scroll** — "Lihat Fitur" scroll ke section fitur

---

### J. Responsivitas Global

- [ ] **Mobile (360px)** — semua halaman readable dan usable
- [ ] **Tablet (768px)** — layout menyesuaikan
- [ ] **Desktop (1280px)** — layout optimal, sidebar admin tampil
- [ ] **Sidebar admin** — collapse di mobile, tetap di desktop

---

## Cara Test

```bash
# Jalankan dev server
npm run dev

# Build untuk production (cek error)
npm run build

# Preview production build
npm run preview
```

---

## Kriteria Selesai

- [ ] Semua item checklist di atas sudah diverifikasi ✅
- [ ] `npm run build` berhasil tanpa error
- [ ] Tidak ada console error di browser saat penggunaan normal
- [ ] Semua alur utama berfungsi end-to-end
