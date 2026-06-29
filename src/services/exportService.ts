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
      <td class="text-center">${i + 1}</td>
      <td>${p.full_name}</td>
      <td>${p.email}</td>
      <td class="font-mono">${p.certificate_code}</td>
      <td class="text-center">
        <span class="status-badge status-${p.delivery_status}">
          ${formatDeliveryStatus(p.delivery_status)}
        </span>
      </td>
      <td>${new Date(p.submitted_at).toLocaleDateString('id-ID')}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Rekap Peserta - ${eventName}</title>
        <style>
          /* Global Styles */
          body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            color: #1f2937; 
            line-height: 1.5;
            margin: 0;
            padding: 2rem;
          }
          
          /* Header */
          .header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #0d9488;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #0d9488;
            letter-spacing: -0.5px;
            margin: 0 0 4px 0;
          }
          .doc-title {
            font-size: 16px;
            font-weight: 600;
            color: #4b5563;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .event-meta {
            text-align: right;
          }
          .event-meta h2 {
            margin: 0 0 4px 0;
            font-size: 18px;
            color: #111827;
          }
          .event-meta p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
          }

          /* Table Styles */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 11pt; 
            margin-bottom: 2rem;
          }
          th { 
            background-color: #0d9488; 
            color: white; 
            padding: 10px 12px; 
            text-align: left; 
            font-weight: 600;
          }
          td { 
            border: 1px solid #e5e7eb; 
            padding: 10px 12px; 
            vertical-align: top;
          }
          tr:nth-child(even) td { 
            background-color: #f0fdfa; 
          }
          tr:nth-child(odd) td {
            background-color: white;
          }

          /* Utility Classes */
          .text-center { text-align: center; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9em; }
          
          /* Badges */
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10pt;
            font-weight: 500;
          }
          .status-success { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef9c3; color: #854d0e; }
          .status-failed { background: #fee2e2; color: #991b1b; }

          /* Footer */
          .footer { 
            margin-top: 3rem; 
            font-size: 10pt; 
            color: #9ca3af; 
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
          }

          /* Print Optimization */
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            @page {
              margin: 1.5cm;
              size: A4 landscape;
            }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand">Certifora</h1>
            <p class="doc-title">Rekap Data Peserta</p>
          </div>
          <div class="event-meta">
            <h2>${eventName}</h2>
            <p>${organizer} &bull; ${new Date(eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50px;" class="text-center">No</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Kode Sertifikat</th>
              <th class="text-center">Status</th>
              <th>Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        
        <div class="footer">
          <div>Total: <strong>${participants.length}</strong> peserta</div>
          <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          <div>Dokumen ini di-generate otomatis oleh Certifora</div>
        </div>
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
