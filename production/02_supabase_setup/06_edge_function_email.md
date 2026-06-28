# 06 — Supabase Edge Function: Kirim Email

> **Prasyarat:** Project Supabase sudah dibuat dan tabel sudah ada.
> **Tool:** Supabase CLI (opsional, bisa juga buat via Dashboard).

---

## Tujuan

Membuat Supabase Edge Function yang menerima data sertifikat (PDF sebagai base64 + data penerima) dan mengirim email via Resend API.

---

## Mengapa Edge Function?

API Key Resend **tidak boleh diekspos di frontend**. Edge Function berjalan di server-side Supabase (Deno runtime), sehingga API key aman.

---

## Setup Resend

### 1. Daftar di Resend

1. Buka [resend.com](https://resend.com) dan daftar (gratis, tanpa kartu kredit)
2. Buat API Key di **API Keys** → "Create API Key"
3. Catat API key (hanya ditampilkan sekali)

### 2. Verifikasi Domain (Opsional tapi Disarankan)

Untuk deliverability yang baik (email tidak masuk spam):
1. Di Resend Dashboard, buka **Domains** → "Add Domain"
2. Ikuti instruksi DNS verification

Jika belum punya domain, bisa pakai domain default Resend untuk testing (`onboarding@resend.dev`).

---

## Buat Edge Function

### Cara 1: Via Supabase Dashboard (Lebih Mudah)

1. Buka Supabase Dashboard → **Edge Functions**
2. Klik **"Create a new function"**
3. Nama function: `send-certificate-email`
4. Paste kode di bawah

### Cara 2: Via Supabase CLI (Opsional)

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Buat function
supabase functions new send-certificate-email
```

---

## Kode Edge Function

Buat file `supabase/functions/send-certificate-email/index.ts`:

```typescript
// supabase/functions/send-certificate-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EmailRequest {
  participantId: string
  recipientEmail: string
  recipientName: string
  pdfBase64: string
  fileName: string
  subject: string
  title: string
  body: string
  eventName: string
  organizer: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Verifikasi bahwa request berasal dari authenticated user (admin)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verifikasi JWT dengan Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Cek apakah user adalah admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!adminData) {
      return new Response(JSON.stringify({ error: 'Not an admin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const payload: EmailRequest = await req.json()

    // Buat HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background-color: #4F46E5; padding: 32px 24px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .content p { color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
            .footer { padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${payload.title}</h1>
            </div>
            <div class="content">
              <p>Yth. ${payload.recipientName},</p>
              <p>${payload.body}</p>
              <p>Sertifikat Anda terlampir pada email ini.</p>
            </div>
            <div class="footer">
              <p>${payload.eventName} — ${payload.organizer}</p>
              <p style="margin-top: 8px;">Email ini dikirim otomatis melalui Certifora.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Kirim email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Certifora <onboarding@resend.dev>',  // Ganti dengan domain terverifikasi jika ada
        to: [payload.recipientEmail],
        subject: payload.subject,
        html: emailHtml,
        attachments: [
          {
            filename: payload.fileName,
            content: payload.pdfBase64,  // base64 encoded PDF
          },
        ],
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      // Log error dan update delivery status
      await supabase.from('delivery_logs').insert({
        participant_id: payload.participantId,
        status: 'failed',
        error_message: JSON.stringify(resendData),
      })

      await supabase
        .from('participants')
        .update({ delivery_status: 'failed' })
        .eq('id', payload.participantId)

      return new Response(JSON.stringify({ 
        error: 'Failed to send email', 
        details: resendData 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Sukses — update delivery status
    await supabase.from('delivery_logs').insert({
      participant_id: payload.participantId,
      status: 'success',
    })

    await supabase
      .from('participants')
      .update({ delivery_status: 'success' })
      .eq('id', payload.participantId)

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: resendData.id 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
```

---

## Set Environment Variables di Supabase

Buka **Settings > Edge Functions** di Supabase Dashboard (atau via CLI):

```bash
# Via CLI
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
```

Atau via Dashboard: **Settings > Edge Functions > Secrets**, tambahkan:
- `RESEND_API_KEY` = API key dari Resend

> `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah tersedia otomatis di environment Edge Function.

---

## Deploy Edge Function

```bash
# Via CLI
supabase functions deploy send-certificate-email --no-verify-jwt
```

> `--no-verify-jwt` karena kita melakukan verifikasi JWT manual di dalam function (untuk fleksibilitas). Alternatif: hapus flag ini dan biarkan Supabase auto-verify JWT.

Atau via Dashboard: paste kode di editor Edge Function dan klik **Deploy**.

---

## Verifikasi

Test Edge Function via curl atau dari frontend:

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/send-certificate-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

Harus mengembalikan error `401` atau `403` (karena token bukan admin) — ini menunjukkan function berjalan dan autentikasi bekerja.

---

## Kriteria Selesai

- [ ] Akun Resend sudah dibuat dan API key sudah didapat
- [ ] Edge Function `send-certificate-email` sudah dibuat
- [ ] Environment variable `RESEND_API_KEY` sudah di-set di Supabase
- [ ] Edge Function sudah di-deploy
- [ ] Test curl mengembalikan response (bukan 404/500 yang menunjukkan function tidak ada)
