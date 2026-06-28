# 01 — Tailwind Theme & CSS Custom Properties

> **Prasyarat:** Folder `03_auth_dan_routing` sudah selesai.
> **File target:** `src/index.css`

---

## Tujuan

Mengatur tema warna, tipografi, dan design tokens melalui Tailwind CSS v4 `@theme` directive, sehingga mudah diganti total di kemudian hari tanpa refactor besar.

---

## Isi File `src/index.css`

Ganti seluruh isi file:

```css
@import "tailwindcss";

/* ============================================
   CERTIFORA — Design Tokens (Tailwind CSS v4)
   ============================================
   Semua warna dan token didefinisikan di sini.
   Untuk mengganti tema, cukup ubah nilai di @theme ini.
   ============================================ */

@theme {
  /* --- Primary (Indigo) --- */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;

  /* --- Status Colors --- */
  --color-success-50: #ecfdf5;
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-danger-50: #fef2f2;
  --color-danger-100: #fee2e2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-danger-700: #b91c1c;

  /* --- Neutral (untuk teks dan background) --- */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;

  /* --- Font Families --- */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* --- Shadows --- */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-modal: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* --- Border Radius --- */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* --- Transitions --- */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}

/* ============================================
   Google Fonts Import (Inter untuk UI)
   ============================================ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ============================================
   Base Styles
   ============================================ */
@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    color: var(--color-neutral-900);
    background-color: var(--color-neutral-50);
  }

  /* Focus ring global — konsisten di semua elemen interaktif */
  *:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
}

/* ============================================
   Utility Classes Custom
   ============================================ */
@layer utilities {
  /* Scrollbar styling */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300);
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: var(--color-neutral-400);
  }
}
```

---

## Penjelasan Design Tokens

| Token | Kegunaan |
|-------|----------|
| `primary-*` | Warna aksen utama (CTA, link, badge aktif) |
| `success-*` | Status "Berhasil" / "Aktif" |
| `warning-*` | Status "Belum Dikirim" / "Draft" |
| `danger-*` | Status "Gagal" / "Ditutup Permanen" |
| `neutral-*` | Teks, background, border |

### Cara Pakai di Komponen

```tsx
// Di JSX, gunakan class Tailwind biasa:
<div className="bg-primary-600 text-white">Primary button</div>
<span className="text-success-600">Berhasil</span>
<span className="text-danger-600">Gagal</span>
<div className="bg-neutral-50 border border-neutral-200">Card</div>
```

### Cara Ganti Tema Nanti

Cukup ubah nilai hex di `@theme` — semua komponen yang menggunakan token akan ikut berubah otomatis. Tidak perlu mencari-cari hardcoded hex di seluruh kode.

---

## Kriteria Selesai

- [ ] File `src/index.css` sudah berisi `@theme` dengan semua design tokens
- [ ] Google Font Inter sudah di-import
- [ ] Warna `primary`, `success`, `warning`, `danger`, `neutral` tersedia
- [ ] `npm run dev` berjalan tanpa error
- [ ] Warna bisa dipakai di class Tailwind (misal `bg-primary-600`)
