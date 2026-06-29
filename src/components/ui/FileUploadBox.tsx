import { useRef, useState, type ChangeEvent } from 'react'
import { FileUp, Camera, FileText } from 'lucide-react'

interface FileUploadBoxProps {
  accept: string
  maxSizeMB?: number
  onFileSelect: (file: File) => void
  label: string
  hint?: string
  preview?: string | null
  icon?: 'camera' | 'document'
  disabled?: boolean
}

export function FileUploadBox({
  accept,
  maxSizeMB = 5,
  onFileSelect,
  label,
  hint,
  preview,
  icon = 'document',
  disabled = false,
}: FileUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMB} MB`)
      return
    }
    setError(null)
    onFileSelect(file)
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-primary-50/50'}
          ${isDragging ? 'border-primary-500 bg-primary-50/80 scale-[1.02]' : ''}
          ${error && !isDragging ? 'border-danger-300 bg-danger-50/30' : !isDragging ? 'border-neutral-300 bg-white/60 backdrop-blur-sm' : ''}
        `}
      >
        {preview ? (
          <div className="space-y-3">
            {icon === 'camera' ? (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-full mx-auto"
              />
            ) : (
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileUp size={24} className="text-neutral-400" />
              </div>
            )}
            <p className="text-sm text-primary-600 font-medium">Klik untuk ganti</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto">
              <div className="text-neutral-400">
                {icon === 'camera' ? <Camera size={24} /> : <FileUp size={24} />}
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-700">{label}</p>
            {hint && <p className="text-xs text-neutral-500">{hint}</p>}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}
