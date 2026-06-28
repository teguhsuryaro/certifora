# 01 — Upload & Preview Template PDF

> **Prasyarat:** Fitur event sudah berjalan (folder `05_fitur_event` selesai).
> **File target:** `src/services/templateService.ts`, `src/lib/pdf-renderer.ts`

---

## Tujuan

Membuat service untuk upload template PDF ke Supabase Storage dan library untuk merender preview PDF di canvas browser.

---

## 1. Template Service (`src/services/templateService.ts`)

```typescript
import { supabase } from '../lib/supabase'
import type { CertificateTemplateUpdate } from '../types/database'

export async function uploadTemplatePdf(eventId: string, file: File): Promise<string> {
  const filePath = `${eventId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('certificate-templates')
    .upload(filePath, file, {
      upsert: true,
      contentType: 'application/pdf',
    })

  if (uploadError) throw uploadError

  // Update tabel certificate_templates
  const { error: updateError } = await supabase
    .from('certificate_templates')
    .update({
      template_file_path: filePath,
      template_file_name: file.name,
      // Reset posisi saat template diganti
      name_position_x: 50.0,
      name_position_y: 50.0,
    })
    .eq('event_id', eventId)

  if (updateError) throw updateError

  return filePath
}

export async function getTemplateUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('certificate-templates')
    .createSignedUrl(filePath, 3600) // 1 jam expiry

  if (!data?.signedUrl) throw new Error('Failed to get template URL')
  return data.signedUrl
}

export async function updateTemplateSettings(
  eventId: string,
  updates: CertificateTemplateUpdate
) {
  const { data, error } = await supabase
    .from('certificate_templates')
    .update(updates)
    .eq('event_id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchTemplateByEventId(eventId: string) {
  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
    .eq('event_id', eventId)
    .single()

  if (error) throw error
  return data
}
```

---

## 2. PDF Renderer Utility (`src/lib/pdf-renderer.ts`)

Library untuk merender halaman pertama PDF sebagai gambar di canvas, digunakan untuk preview:

```typescript
/**
 * Merender halaman pertama PDF menjadi image Data URL
 * Menggunakan pdfjs-dist untuk rendering (install: npm install pdfjs-dist)
 * 
 * CATATAN: Jika tidak ingin install pdfjs-dist, alternatifnya:
 * - Gunakan <iframe> atau <embed> untuk menampilkan PDF langsung
 * - Gunakan library react-pdf
 * 
 * Untuk kesederhanaan, kita gunakan pendekatan canvas:
 */

export async function renderPdfToImage(
  pdfUrl: string,
  scale: number = 2
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Dynamic import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist')
  
  // Set worker (gunakan CDN untuk simplicity)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const pdf = await pdfjsLib.getDocument(pdfUrl).promise
  const page = await pdf.getPage(1)
  
  const viewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  const context = canvas.getContext('2d')!
  await page.render({ canvasContext: context, viewport }).promise

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
  }
}
```

> **Dependency tambahan:** Install `pdfjs-dist`:
> ```bash
> npm install pdfjs-dist
> ```

---

## Kriteria Selesai

- [ ] Service upload template PDF ke Supabase Storage berfungsi
- [ ] Service get signed URL berfungsi
- [ ] Service update template settings berfungsi
- [ ] PDF renderer utility bisa mengkonversi PDF ke gambar canvas
- [ ] `pdfjs-dist` sudah diinstall
