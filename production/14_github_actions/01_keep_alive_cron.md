# 01 — GitHub Actions Cron Job: Keep Supabase Alive

> **Prasyarat:** Semua fitur utama sudah diimplementasi (folder 01–13 selesai).
> **File target:** `.github/workflows/keep-supabase-alive.yml`

---

## Tujuan

Membuat GitHub Actions scheduled workflow yang berjalan 3x/minggu untuk melakukan request ringan ke Supabase, mencegah auto-pause project free tier.

---

## Buat File Workflow

Buat file `.github/workflows/keep-supabase-alive.yml` di root proyek:

```yaml
name: Keep Supabase Alive

on:
  schedule:
    # Senin, Rabu, Jumat jam 03:00 UTC (10:00 WIB)
    - cron: '0 3 * * 1,3,5'
  workflow_dispatch:
    # Bisa dijalankan manual dari tab Actions di GitHub

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Ping Supabase REST API
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X GET \
            "${{ secrets.SUPABASE_URL }}/rest/v1/events?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}")
          
          echo "Supabase ping response: $response"
          
          if [ "$response" -ge 200 ] && [ "$response" -lt 400 ]; then
            echo "✅ Supabase is alive (HTTP $response)"
          else
            echo "⚠️ Supabase returned HTTP $response"
            exit 1
          fi

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

## Setup GitHub Secrets

Di repository GitHub:

1. Buka **Settings > Secrets and variables > Actions**
2. Klik **"New repository secret"**
3. Tambahkan 2 secrets:

| Secret Name | Value |
|-------------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` (sama dengan `.env`) |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (sama dengan `.env`) |

---

## Buat File LAST_PING.md

Buat file `LAST_PING.md` di root proyek:

```markdown
Last ping: not yet
```

> File ini akan otomatis di-update oleh GitHub Actions setiap kali cron berjalan.

---

## Setup Git Repository di GitHub

Jika belum ada remote:

```bash
# Buat repository di GitHub (bisa publik atau privat)
# Lalu hubungkan:
git remote add origin https://github.com/USERNAME/certifora.git
git branch -M main
git push -u origin main
```

---

## Verifikasi

1. Push workflow ke GitHub
2. Buka tab **Actions** di repository GitHub
3. Workflow "Keep Supabase Alive" harus muncul
4. Klik **"Run workflow"** (manual trigger) untuk test
5. Pastikan job berhasil (ping Supabase return 200)

---

## Catatan Penting

- **Repo publik:** GitHub Actions gratis unlimited.
- **Repo privat:** GitHub Actions gratis 2.000 menit/bulan (cukup, karena job ini hanya berjalan ~10 detik, 3x/minggu = ~2 menit/bulan).
- **Commit otomatis** ke `LAST_PING.md` menjaga repo tetap "aktif" (mencegah GitHub mendisable scheduled workflow setelah 60 hari tanpa aktivitas).
- Jangan lupa setup **GitHub Secrets** sebelum workflow pertama berjalan.

---

## Kriteria Selesai

- [ ] File `.github/workflows/keep-supabase-alive.yml` sudah dibuat
- [ ] GitHub Secrets `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sudah ditambahkan
- [ ] File `LAST_PING.md` sudah dibuat
- [ ] Workflow bisa di-trigger manual dan berhasil
- [ ] Ping Supabase mengembalikan HTTP 200
- [ ] Commit otomatis ke `LAST_PING.md` berfungsi
