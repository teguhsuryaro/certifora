import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Draggable, { type DraggableEvent, type DraggableData } from 'react-draggable'
import { Button, FileUploadBox, PageLoading, Input, Select } from '../../components/ui'
import * as templateService from '../../services/templateService'
import { renderPdfToImage } from '../../lib/pdf-renderer'
import { AlertCircle, Lightbulb, Save, FileText, UploadCloud, RefreshCw } from 'lucide-react'
import type { CertificateTemplate, QrPosition, TextFormat } from '../../types/database'

// Font options
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

const QR_POSITIONS: { value: QrPosition; label: string }[] = [
  { value: 'top_left', label: 'Kiri Atas' },
  { value: 'top_right', label: 'Kanan Atas' },
  { value: 'bottom_left', label: 'Kiri Bawah' },
  { value: 'bottom_right', label: 'Kanan Bawah' },
]

export default function TemplateEditorPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)

  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [pdfImage, setPdfImage] = useState<string | null>(null)
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  // Editable settings
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
  
  const [initialSettings, setInitialSettings] = useState(settings)
  
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings)
  }, [settings, initialSettings])

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
      const newSettings = {
        name_position_x: data.name_position_x,
        name_position_y: data.name_position_y,
        name_font_size: data.name_font_size,
        name_font_color: data.name_font_color,
        name_font_family: data.name_font_family,
        name_text_format: data.name_text_format,
        qr_position: data.qr_position,
        qr_size: data.qr_size,
      }
      setSettings(newSettings)
      setInitialSettings(newSettings)

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

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    if (!canvasContainerRef.current || pdfDimensions.width === 0) return
    const containerRect = canvasContainerRef.current.getBoundingClientRect()
    const nodeWidth = nameRef.current?.offsetWidth || 0
    const nodeHeight = nameRef.current?.offsetHeight || 0
    
    // xPercent = center of the node relative to container width
    const xPercent = ((data.x + nodeWidth / 2) / containerRect.width) * 100
    const yPercent = ((data.y + nodeHeight / 2) / containerRect.height) * 100

    setSettings(prev => ({
      ...prev,
      name_position_x: Number(Math.max(0, Math.min(100, xPercent)).toFixed(1)),
      name_position_y: Number(Math.max(0, Math.min(100, yPercent)).toFixed(1)),
    }))
  }

  const handleSave = async () => {
    if (!eventId || !isDirty) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await templateService.updateTemplateSettings(eventId, settings)
      setInitialSettings(settings)
      setSaveMessage('Pengaturan berhasil disimpan!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      setSaveMessage('Gagal menyimpan: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const getSampleName = () => {
    const name = 'Nama Peserta Contoh'
    switch (settings.name_text_format) {
      case 'uppercase': return name.toUpperCase()
      case 'lowercase': return name.toLowerCase()
      case 'title_case': return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      default: return name
    }
  }

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
  
  // Calculate controlled position for the draggable element
  const containerW = canvasContainerRef.current?.offsetWidth || 500
  const containerH = canvasContainerRef.current?.offsetHeight || 300
  const nodeW = nameRef.current?.offsetWidth || 0
  const nodeH = nameRef.current?.offsetHeight || 0
  
  const controlledPosition = {
    x: (settings.name_position_x / 100) * containerW - nodeW / 2,
    y: (settings.name_position_y / 100) * containerH - nodeH / 2
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="grid lg:grid-cols-5 gap-6 mt-4">
        {/* === Panel Preview (Kolom Kiri - 3/5) === */}
        <div className="lg:col-span-3">
          <div className="glass-card p-4 sm:p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary-600" />
              Pratinjau Sertifikat
            </h2>
            
            {!template?.template_file_path ? (
              <div className="flex-1 min-h-[400px] border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center text-neutral-500 bg-neutral-50/50">
                <UploadCloud size={48} className="text-neutral-400 mb-4" />
                <p className="font-medium text-neutral-700">Belum ada template PDF</p>
                <p className="text-sm mt-1 text-center max-w-sm">Unggah file PDF di panel pengaturan untuk mulai menyesuaikan tata letak.</p>
              </div>
            ) : renderError ? (
              <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center p-8 bg-danger-50 rounded-2xl border border-danger-200">
                <AlertCircle size={32} className="text-danger-500 mb-3" />
                <p className="font-medium text-danger-800 text-center mb-4">{renderError}</p>
                <Button variant="secondary" onClick={() => loadTemplate()} icon={<RefreshCw size={16} />}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div 
                  ref={canvasContainerRef}
                  className="relative border border-neutral-200 shadow-sm bg-neutral-100 overflow-hidden rounded-xl w-full"
                  style={{
                    backgroundImage: `url(${pdfImage})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    aspectRatio: `${pdfDimensions.width} / ${pdfDimensions.height}`,
                    maxHeight: '75vh',
                  }}
                >
                  {/* Draggable Name Element */}
                  <Draggable
                    bounds="parent"
                    onDrag={handleDrag}
                    position={controlledPosition}
                  >
                    <div
                      ref={nameRef}
                      className="absolute cursor-move border-[1.5px] border-dashed border-primary-500 bg-primary-50/70 px-3 py-1.5 rounded-md select-none hover:bg-primary-50 transition-colors shadow-sm"
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
                    className="absolute border-[1.5px] border-dashed border-neutral-400 bg-white/90 flex flex-col items-center justify-center rounded-md shadow-sm transition-all"
                    style={{
                      ...getQrPositionStyle(),
                      width: `${settings.qr_size * 0.6}px`,
                      height: `${settings.qr_size * 0.6}px`,
                    }}
                  >
                    <span className="text-xs font-bold text-neutral-400 tracking-widest">QR</span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50/80 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5">
                  <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Tips:</strong> Tarik dan geser (drag) teks nama untuk mengatur posisi secara visual. Klik tombol <strong>Simpan Pengaturan</strong> setelah selesai agar perubahan diterapkan ke sertifikat peserta.
                  </p>
                </div>
              </div>
            )}
            
            {/* Mobile notice */}
            <p className="mt-4 text-xs text-center text-neutral-400 lg:hidden">
              Untuk pengalaman editor terbaik, gunakan perangkat berlayar besar (Tablet/PC).
            </p>
          </div>
        </div>

        {/* === Panel Pengaturan (Kolom Kanan - 2/5) === */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 sm:p-6 lg:sticky lg:top-24">
            
            {/* Section: Upload Template */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">1</span>
                File Template
              </h3>
              
              {!template?.template_file_path ? (
                <FileUploadBox
                  accept=".pdf"
                  maxSizeMB={10}
                  onFileSelect={handleUploadTemplate}
                  label="Upload PDF"
                  hint="File PDF yang akan dijadikan background"
                  icon="document"
                  disabled={isUploading}
                />
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {template.template_file_name || 'template.pdf'}
                      </p>
                      <p className="text-xs text-neutral-500">PDF Document</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
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
                    Ganti File
                  </Button>
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-200 w-full mb-8"></div>

            {/* Section: Pengaturan Nama */}
            <div className="mb-8 space-y-5">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">2</span>
                Teks Nama
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="font"
                  label="Font Family"
                  options={FONT_OPTIONS}
                  value={settings.name_font_family}
                  onChange={(e) => setSettings(prev => ({ ...prev, name_font_family: e.target.value }))}
                />

                <Input
                  id="fontSize"
                  label="Ukuran (pt)"
                  type="number"
                  min={8}
                  max={120}
                  value={settings.name_font_size}
                  onChange={(e) => setSettings(prev => ({ ...prev, name_font_size: Number(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="textFormat"
                  label="Format Kapitalisasi"
                  options={FORMAT_OPTIONS}
                  value={settings.name_text_format}
                  onChange={(e) => setSettings(prev => ({ ...prev, name_text_format: e.target.value as TextFormat }))}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Warna Font</label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-neutral-300 shadow-sm focus-within:ring-2 focus-within:ring-primary-500">
                      <input
                        type="color"
                        value={settings.name_font_color}
                        onChange={(e) => setSettings(prev => ({ ...prev, name_font_color: e.target.value }))}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <Input
                      id="fontColorText"
                      value={settings.name_font_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, name_font_color: e.target.value }))}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

            <div className="h-px bg-neutral-200 w-full mb-8"></div>

            {/* Section: Pengaturan QR Code */}
            <div className="mb-8 space-y-5">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">3</span>
                QR Code
              </h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Posisi Sudut</label>
                <div className="grid grid-cols-4 gap-2">
                  {QR_POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setSettings(prev => ({ ...prev, qr_position: pos.value }))}
                      title={pos.label}
                      className={`
                        relative h-14 rounded-xl border-2 transition-all flex items-center justify-center
                        ${settings.qr_position === pos.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }
                      `}
                    >
                      <div className="w-7 h-7 border border-neutral-300 bg-white rounded-sm relative">
                        <div className={`absolute w-3 h-3 bg-primary-500 rounded-sm
                          ${pos.value === 'top_left' ? 'top-0.5 left-0.5' : ''}
                          ${pos.value === 'top_right' ? 'top-0.5 right-0.5' : ''}
                          ${pos.value === 'bottom_left' ? 'bottom-0.5 left-0.5' : ''}
                          ${pos.value === 'bottom_right' ? 'bottom-0.5 right-0.5' : ''}
                        `} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="qrSize"
                label="Ukuran Lebar/Tinggi (px)"
                type="number"
                min={40}
                max={200}
                value={settings.qr_size}
                onChange={(e) => setSettings(prev => ({ ...prev, qr_size: Number(e.target.value) }))}
              />
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-neutral-200">
              <Button
                variant="primary"
                className="w-full h-12 text-base font-semibold shadow-md disabled:opacity-50"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!isDirty || isSaving}
                icon={!isSaving && <Save size={20} />}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
              
              {/* Toast Message (Inline) */}
              {saveMessage && (
                <div className={`mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                  saveMessage.includes('Gagal') ? 'bg-danger-50 text-danger-700 border border-danger-200' : 'bg-success-50 text-success-700 border border-success-200'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

