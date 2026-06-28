# 01 — Export Data Peserta ke Excel & PDF

> **Prasyarat:** Validasi sertifikat sudah selesai (folder `11_validasi_sertifikat` selesai).
> **File target:** `src/pages/admin/ExportPage.tsx`, `src/services/exportService.ts`

---

## Tujuan

Mengimplementasikan halaman export data peserta per event ke format Excel (.xlsx) dan PDF, berisi seluruh data peserta dan status pengiriman.

---

## 1. Export Service (`src/services/exportService.ts`)

```typescript
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Participant } from '../types/database'

// ============================================
// EXPORT KE EXCEL
// ============================================
export function exportToExcel(
  participants: Participant[],
  eventName: string,
  organizer: string
) {
  const data = participants.map((p, index) => ({
    'No': index + 1,
    'Nama Lengkap': p.full_name,
    'Email': p.email,
    'Kode Sertifikat': p.certificate_code,
    'Status Pengiriman': formatDeliveryStatus(p.delivery_status),
    'Tanggal Daftar': new Date(p.submitted_at).toLocaleString('id-ID'),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Peserta')

  // Auto-width kolom
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map(row => String((row as any)[key] || '').length)) + 2,
  }))
  worksheet['!cols'] = colWidths

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  const fileName = `Peserta_${sanitizeFileName(eventName)}_${new Date().toISOString().split('T')[0]}.xlsx`
  saveAs(blob, fileName)
}

// ============================================
// EXPORT KE PDF (menggunakan print/download tabel HTML)
// ============================================
export function exportToPdf(
  participants: Participant[],
  eventName: string,
  organizer: string,
  eventDate: string
) {
  // Buat HTML tabel untuk di-print sebagai PDF
  const rows = participants.map((p, i) => `
    <tr>
      <td style="border:1px solid #ddd;padding:8px;text-align:center">${i + 1}</td>
      <td style="border:1px solid #ddd;padding:8px">${p.full_name}</td>
      <td style="border:1px solid #ddd;padding:8px">${p.email}</td>
      <td style="border:1px solid #ddd;padding:8px;font-family:monospace">${p.certificate_code}</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center">${formatDeliveryStatus(p.delivery_status)}</td>
      <td style="border:1px solid #ddd;padding:8px">${new Date(p.submitted_at).toLocaleDateString('id-ID')}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Data Peserta - ${eventName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .info { color: #666; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #4F46E5; color: white; padding: 10px 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 20px; font-size: 11px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${eventName}</h1>
        <p class="info">${organizer} • ${new Date(eventDate).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        })} • ${participants.length} peserta</p>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Kode Sertifikat</th>
              <th>Status</th>
              <th>Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        
        <p class="footer">Diekspor dari Certifora pada ${new Date().toLocaleString('id-ID')}</p>
      </body>
    </html>
  `

  // Buka di tab baru untuk print/save as PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

// ============================================
// HELPERS
// ============================================
function formatDeliveryStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Belum Dikirim',
    success: 'Berhasil',
    failed: 'Gagal',
  }
  return map[status] || status
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_')
}
```

---

## 2. Halaman Export (`src/pages/admin/ExportPage.tsx`)

```typescript
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import * as exportService from '../../services/exportService'
import { supabase } from '../../lib/supabase'
import { Button, PageLoading, StatusBadge } from '../../components/ui'

export default function ExportPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [participants, setParticipants] = useState<any[]>([])
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (eventId) loadData()
  }, [eventId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pData, eData] = await Promise.all([
        participantService.fetchParticipants(eventId!),
        supabase.from('events').select('*').eq('id', eventId).single(),
      ])
      setParticipants(pData || [])
      setEvent(eData.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (!event) return
    exportService.exportToExcel(participants, event.name, event.organizer)
  }

  const handleExportPdf = () => {
    if (!event) return
    exportService.exportToPdf(participants, event.name, event.organizer, event.event_date)
  }

  if (isLoading) return <PageLoading />

  const pendingCount = participants.filter(p => p.delivery_status === 'pending').length
  const successCount = participants.filter(p => p.delivery_status === 'success').length
  const failedCount = participants.filter(p => p.delivery_status === 'failed').length

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-500 mb-4">
        <Link to={`/admin/events/${eventId}`} className="hover:text-primary-600">
          ← Kembali ke Detail Event
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Export Data Peserta</h1>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Ringkasan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-900">{participants.length}</p>
            <p className="text-xs text-neutral-500">Total</p>
          </div>
          <div className="text-center p-3 bg-success-50 rounded-lg">
            <p className="text-2xl font-bold text-success-600">{successCount}</p>
            <p className="text-xs text-success-700">Terkirim</p>
          </div>
          <div className="text-center p-3 bg-warning-50 rounded-lg">
            <p className="text-2xl font-bold text-warning-600">{pendingCount}</p>
            <p className="text-xs text-warning-700">Belum</p>
          </div>
          <div className="text-center p-3 bg-danger-50 rounded-lg">
            <p className="text-2xl font-bold text-danger-600">{failedCount}</p>
            <p className="text-xs text-danger-700">Gagal</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">Export Excel (.xlsx)</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Spreadsheet lengkap dengan seluruh data peserta
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={participants.length === 0}
            icon={<span>📊</span>}
          >
            Download
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">Export PDF</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Tabel peserta dalam format cetak PDF
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportPdf}
            disabled={participants.length === 0}
            icon={<span>📄</span>}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## Kriteria Selesai

- [ ] Export Excel berfungsi dan mengunduh file `.xlsx`
- [ ] File Excel berisi kolom: No, Nama, Email, Kode, Status, Tanggal
- [ ] Lebar kolom otomatis menyesuaikan isi
- [ ] Export PDF membuka tab baru dengan opsi print/save as PDF
- [ ] Tabel PDF rapi dengan styling, header warna, zebra stripe
- [ ] Halaman export menampilkan ringkasan jumlah peserta per status
- [ ] Tombol disabled jika belum ada peserta
- [ ] Nama file termasuk nama event dan tanggal
