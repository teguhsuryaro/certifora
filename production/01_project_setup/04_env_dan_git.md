# 04 — Setup Environment Variables & Konfigurasi Git

> **Prasyarat:** Struktur folder sudah dibuat (file `03_struktur_folder.md` sudah selesai).
> **Folder kerja:** `e:\CODING\certifora\`

---

## Tujuan

Menyiapkan file environment variables, konfigurasi Git, dan file konfigurasi proyek lainnya.

---

## 1. File Environment Variables

### Buat `.env.example`

File ini menjadi referensi variable apa saja yang dibutuhkan:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App
VITE_APP_URL=http://localhost:5173
```

### Buat `.env`

Copy dari `.env.example` dan isi dengan nilai sebenarnya (nilai didapat setelah setup Supabase di tahap 02):

```env
# Supabase (isi setelah tahap 02_supabase_setup)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# App
VITE_APP_URL=http://localhost:5173
```

> **PENTING:** File `.env` berisi data sensitif dan TIDAK boleh di-commit ke Git.

---

## 2. Update `.gitignore`

Pastikan `.gitignore` berisi setidaknya:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
dist-ssr/
*.local

# IDE
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Supabase (jika nanti setup CLI lokal)
supabase/.temp/
```

---

## 3. Inisialisasi Git Repository

```bash
git init
git add .
git commit -m "chore: initial project setup - Vite + React + TypeScript + Tailwind"
```

---

## 4. Update `index.html`

Ganti isi `index.html` dengan metadata yang sesuai:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Certifora — Platform untuk membuat, mengelola, dan mengirim sertifikat digital." />
    <meta name="robots" content="index, follow" />
    <title>Certifora — Sertifikat Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Kriteria Selesai

- [ ] File `.env.example` sudah dibuat
- [ ] File `.env` sudah dibuat (kosong, akan diisi di tahap 02)
- [ ] File `.gitignore` sudah mencakup `.env` dan file sensitif lainnya
- [ ] Git repository sudah diinisialisasi dengan commit awal
- [ ] `index.html` sudah diupdate dengan metadata Certifora
- [ ] `npm run dev` masih berjalan tanpa error
