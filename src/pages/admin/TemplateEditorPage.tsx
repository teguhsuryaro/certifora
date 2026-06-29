import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Draggable, { type DraggableEvent, type DraggableData } from 'react-draggable'
import { Button, FileUploadBox, PageLoading, Input, Select } from '../../components/ui'
import * as templateService from '../../services/templateService'
import { renderPdfToImage } from '../../lib/pdf-renderer'
import { ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, AlertCircle, Lightbulb } from 'lucide-react'
import type { CertificateTemplate, QrPosition, TextFormat } from '../../types/database'

// Font options (Google Fonts tersedia di /public/fonts/)
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
]

const FORMAT_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'title_case', label: 'Title Case' },
]

const QR_POSITIONS: { value: QrPosition; label: string; icon: React.ReactNode }[] = [
  { value: 'top_left', label: 'Kiri Atas', icon: <ArrowUpLeft size={16} /> },
  { value: 'top_right', label: 'Kanan Atas', icon: <ArrowUpRight size={16} /> },
  { value: 'bottom_left', label: 'Kiri Bawah', icon: <ArrowDownLeft size={16} /> },
  { value: 'bottom_right', label: 'Kanan Bawah', icon: <ArrowDownRight size={16} /> },
]

export default function TemplateEditorPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [pdfImage, setPdfImage] = useState<string | null>(null)
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  // Editable settings (local state, saved on "Simpan")
  const [settings, setSettings] = useState({
    name_position_x: 50,
    name_position_y: 50,
    name_font_size: 24,
    name_font_color: '#000000',
    name_font_family: 'Inter',
    name_text_format: 'original' as TextFormat,
    qr_position: 'bottom_right' as QrPosition,
    qr_size: 80,
  })

  // Load template data
  useEffect(() => {
    if (!eventId) return
    loadTemplate()
  }, [eventId])

  const loadTemplate = async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const data = await templateService.fetchTemplateByEventId(eventId)
      setTemplate(data)
      setSettings({
        name_position_x: data.name_position_x,
        name_position_y: data.name_position_y,
        name_font_size: data.name_font_size,
        name_font_color: data.name_font_color,
        name_font_family: data.name_font_family,
        name_text_format: data.name_text_format,
        qr_position: data.qr_position,
        qr_size: data.qr_size,
      })

      // Render PDF preview
      if (data.template_file_path) {
        try {
          const url = await templateService.getTemplateUrl(data.template_file_path)
          const result = await renderPdfToImage(url, 1.5)
          setPdfImage(result.dataUrl)
          setPdfDimensions({ width: result.width, height: result.height })
          setRenderError(null)
        } catch (renderErr: any) {
          console.error('Failed to render PDF preview:', renderErr)
          setRenderError(`Error: ${renderErr?.message || String(renderErr)}`)
        }
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle template PDF upload
  const handleUploadTemplate = async (file: File) => {
    if (!eventId) return
    setIsUploading(true)
    try {
      await templateService.uploadTemplatePdf(eventId, file)
      await loadTemplate()
    } catch (error) {
      console.error('Failed to upload template:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag end — update position
  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    if (!canvasContainerRef.current || pdfDimensions.width === 0) return

    const containerRect = canvasContainerRef.current.getBoundingClientRect()
    const xPercent = ((data.x + data.node.offsetWidth / 2) / containerRect.width) * 100
    const yPercent = ((data.y + data.node.offsetHeight / 2) / containerRect.height) * 100

    setSettings(prev => ({
      ...prev,
      name_position_x: Math.max(0, Math.min(100, xPercent)),
      name_position_y: Math.max(0, Math.min(100, yPercent)),
    }))
  }

  // Save settings
  const handleSave = async () => {
    if (!eventId) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await templateService.updateTemplateSettings(eventId, settings)
      setSaveMessage('Pengaturan berhasil disimpan!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      setSaveMessage('Gagal menyimpan: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Format sample name
  const getSampleName = () => {
    const name = 'Nama Peserta Contoh'
    switch (settings.name_text_format) {
      case 'uppercase': return name.toUpperCase()
      case 'lowercase': return name.toLowerCase()
      case 'title_case': return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      default: return name
    }
  }

  // Get QR position style
  const getQrPositionStyle = () => {
    const margin = 16
    switch (settings.qr_position) {
      case 'top_left': return { top: margin, left: margin }
      case 'top_right': return { top: margin, right: margin }
      case 'bottom_left': return { bottom: margin, left: margin }
      case 'bottom_right': return { bottom: margin, right: margin }
    }
  }

  if (isLoading) return <PageLoading />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Editor Template Sertifikat</h1>
        <p className="text-neutral-500 mt-1">Atur posisi nama peserta dan QR code di template</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* === Kanvas Preview (70%) === */}
        <div className="lg:w-[70%]">
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pratinjau Sertifikat</h2>
            
            {!template?.template_file_path ? (
              <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                Belum ada template PDF. Silakan unggah di panel pengaturan.
              </div>
            ) : renderError ? (
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle size={24} className="text-red-500 mb-2" />
                <p className="text-sm font-medium text-red-800 text-center">{renderError}</p>
                <Button size="sm" className="mt-4" onClick={() => loadTemplate()}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div 
                ref={canvasContainerRef}
                className="relative border border-gray-300 shadow-inner bg-gray-50 overflow-hidden"
                style={{
                  backgroundImage: `url(${pdfImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '100%',
                  aspectRatio: `${pdfDimensions.width} / ${pdfDimensions.height}`,
                  maxHeight: '70vh',
                }}
              >
                {/* Draggable Name Element */}
                <Draggable
                  bounds="parent"
                  onStop={handleDragStop}
                  defaultPosition={{
                    x: (settings.name_position_x / 100) * (canvasContainerRef.current?.offsetWidth || 500) - 50,
                    y: (settings.name_position_y / 100) * (canvasContainerRef.current?.offsetHeight || 300) - 15,
                  }}
                >
                  <div
                    className="absolute cursor-move border-2 border-dashed border-primary-400 bg-primary-50/50 px-3 py-1 rounded select-none"
                    style={{
                      fontSize: `${settings.name_font_size * 0.8}px`,
                      color: settings.name_font_color,
                      fontFamily: settings.name_font_family,
                    }}
                  >
                    {getSampleName()}
                  </div>
                </Draggable>

                {/* QR Code Preview */}
                <div
                  className="absolute border-2 border-dashed border-neutral-400 bg-white/80 flex items-center justify-center rounded"
                  style={{
                    ...getQrPositionStyle(),
                    width: `${settings.qr_size * 0.6}px`,
                    height: `${settings.qr_size * 0.6}px`,
                  }}
                >
                  <span className="text-xs text-neutral-500">QR</span>
                </div>
              </div>
            )}

            {pdfImage && (
              <div className="mt-3 flex justify-between items-center">
                <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <Lightbulb size={14} className="text-amber-500 shrink-0" />
                  Drag teks nama untuk mengatur posisi. Klik simpan setelah selesai.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Trigger file upload dialog
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.pdf'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleUploadTemplate(file)
                    }
                    input.click()
                  }}
                >
                  Ganti Template
                </Button>
              </div>
            )}
          </div>

          {/* Mobile notice */}
          <p className="mt-3 text-xs text-neutral-400 lg:hidden">
            ℹ️ Untuk pengalaman terbaik mengatur posisi, gunakan desktop/laptop.
          </p>
        </div>

        {/* === Panel Kontrol (30%) === */}
        <div className="lg:w-[30%]">
          <div className="glass-card p-4 sm:p-6 lg:sticky lg:top-24 space-y-6">
            <h2 className="font-semibold text-neutral-900">Pengaturan</h2>

            {!template?.template_file_path && (
              <div className="mb-4">
                <FileUploadBox
                  accept=".pdf"
                  maxSizeMB={10}
                  onFileSelect={handleUploadTemplate}
                  label="Upload Template PDF"
                  hint="File PDF yang akan digunakan sebagai template sertifikat"
                  icon="document"
                  disabled={isUploading}
                />
              </div>
            )}

            {/* Nama Peserta Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-700 border-b border-neutral-100 pb-2">
                Nama Peserta
              </h3>

              <Select
                id="font"
                label="Font"
                options={FONT_OPTIONS}
                value={settings.name_font_family}
                onChange={(e) => setSettings(prev => ({ ...prev, name_font_family: e.target.value }))}
              />

              <Input
                id="fontSize"
                label="Ukuran Font (pt)"
                type="number"
                min={8}
                max={72}
                value={settings.name_font_size}
                onChange={(e) => setSettings(prev => ({ ...prev, name_font_size: Number(e.target.value) }))}
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Warna Font</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.name_font_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_font_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.name_font_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_font_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <Select
                id="textFormat"
                label="Format Teks"
                options={FORMAT_OPTIONS}
                value={settings.name_text_format}
                onChange={(e) => setSettings(prev => ({ ...prev, name_text_format: e.target.value as TextFormat }))}
              />

              {/* Posisi numerik (alternatif drag, terutama untuk mobile) */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="posX"
                  label="Posisi X (%)"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.name_position_x}
                  onChange={(e) => setSettings(prev => ({ ...prev, name_position_x: Number(e.target.value) }))}
                />
                <Input
                  id="posY"
                  label="Posisi Y (%)"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.name_position_y}
                  onChange={(e) => setSettings(prev => ({ ...prev, name_position_y: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* QR Code Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-700 border-b border-neutral-100 pb-2">
                QR Code
              </h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Posisi</label>
                <div className="grid grid-cols-2 gap-2">
                  {QR_POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setSettings(prev => ({ ...prev, qr_position: pos.value }))}
                      className={`
                        p-3 rounded-lg border-2 text-center transition-all text-sm
                        ${settings.qr_position === pos.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                        }
                      `}
                    >
                      <span className="text-lg block mb-1">{pos.icon}</span>
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="qrSize"
                label="Ukuran QR (px)"
                type="number"
                min={40}
                max={200}
                value={settings.qr_size}
                onChange={(e) => setSettings(prev => ({ ...prev, qr_size: Number(e.target.value) }))}
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('Gagal') ? 'text-danger-600' : 'text-success-600'}`}>
                  {saveMessage}
                </p>
              )}
              <Button
                variant="primary"
                className="w-full"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Simpan Pengaturan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
