import { useRef, useState, type ChangeEvent } from 'react'

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran
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
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-primary-50/50'}
          ${error ? 'border-danger-300 bg-danger-50/30' : 'border-neutral-300 bg-neutral-50'}
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
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-2xl">📄</span>
              </div>
            )}
            <p className="text-sm text-primary-600 font-medium">Klik untuk ganti</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-xl">
                {icon === 'camera' ? '📸' : '📁'}
              </span>
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
