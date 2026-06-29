import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import * as exportService from '../../services/exportService'
import { supabase } from '../../lib/supabase'
import { Button, PageLoading, StatusBadge } from '../../components/ui'
import { FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react'

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
        <Link to={`/admin/events/${eventId}`} className="hover:text-primary-600 inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Kembali ke Detail Event
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
            icon={<FileSpreadsheet size={16} />}
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
            icon={<FileText size={16} />}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
