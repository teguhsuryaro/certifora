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
