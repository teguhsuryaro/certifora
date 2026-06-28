# 01 — Inisialisasi Proyek Vite + React + TypeScript

> **Prasyarat:** Node.js >= 18 terinstall, npm tersedia di terminal.
> **Folder kerja:** `e:\CODING\certifora\`

---

## Tujuan

Menginisialisasi proyek frontend menggunakan Vite + React + TypeScript di folder root proyek.

---

## Langkah-langkah

### 1. Inisialisasi Vite

Jalankan perintah di folder `e:\CODING\certifora\`:

```bash
npx -y create-vite@latest ./ --template react-ts
```

> **Catatan:** Flag `./` berarti proyek dibuat di direktori saat ini. Jika ada file lain (seperti `spesifikasi.md`), Vite akan meminta konfirmasi — pilih "Yes" untuk melanjutkan.

### 2. Install Dependencies

```bash
npm install
```

### 3. Verifikasi Proyek Berjalan

```bash
npm run dev
```

Pastikan server dev berjalan di `http://localhost:5173` dan menampilkan halaman default Vite + React.

---

## Struktur Folder Setelah Inisialisasi

```
certifora/
├── production/          ← folder planning (jangan sentuh)
├── spesifikasi.md       ← dokumen spesifikasi (jangan sentuh)
├── node_modules/
├── public/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── .gitignore
```

---

## Kriteria Selesai

- [ ] Perintah `npx create-vite` berhasil di folder root
- [ ] `npm install` selesai tanpa error
- [ ] `npm run dev` menampilkan halaman default React di browser
- [ ] File `spesifikasi.md` dan folder `production/` masih utuh
