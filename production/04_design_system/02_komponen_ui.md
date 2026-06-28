# 02 — Komponen UI Reusable

> **Prasyarat:** Theme sudah dikonfigurasi (file `01_tailwind_theme.md` sudah selesai).
> **Folder target:** `src/components/ui/`

---

## Tujuan

Membuat library komponen UI reusable yang digunakan di seluruh aplikasi. Setiap komponen menggunakan design tokens dari theme.

---

## Daftar Komponen

Buat file-file berikut di `src/components/ui/`:

---

### 1. `Button.tsx`

```typescript
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-150 focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
```

---

### 2. `StatusBadge.tsx`

```typescript
type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'primary'

interface StatusBadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  danger: 'bg-danger-50 text-danger-700 border-danger-100',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
}

export function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
```

---

### 3. `Modal.tsx`

```typescript
import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={`
          relative bg-white rounded-xl shadow-modal w-full ${sizeClasses[size]}
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   ConfirmModal — modal konfirmasi standar
   ============================================ */
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  variant?: 'primary' | 'danger'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-neutral-600">{message}</p>
    </Modal>
  )
}
```

---

### 4. `FileUploadBox.tsx`

```typescript
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
```

---

### 5. `ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showCount?: boolean
}

export function ProgressBar({ current, total, label, showCount = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        {label && <span className="text-neutral-600">{label}</span>}
        {showCount && (
          <span className="text-neutral-500 font-medium">
            {current} / {total} ({percentage}%)
          </span>
        )}
      </div>
      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

---

### 6. `EmptyState.tsx`

```typescript
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-neutral-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
```

---

### 7. `LoadingSpinner.tsx`

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full border-primary-600 border-t-transparent
        ${sizeClasses[size]} ${className}
      `}
    />
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  )
}
```

---

### 8. `Input.tsx`

```typescript
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 border rounded-lg outline-none transition-all text-sm
            ${error
              ? 'border-danger-300 focus:ring-2 focus:ring-danger-500 focus:border-danger-500'
              : 'border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

---

### 9. `Textarea.tsx`

```typescript
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 border rounded-lg outline-none transition-all text-sm resize-y min-h-[100px]
            ${error
              ? 'border-danger-300 focus:ring-2 focus:ring-danger-500'
              : 'border-neutral-300 focus:ring-2 focus:ring-primary-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
```

---

### 10. `Select.tsx`

```typescript
import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 border rounded-lg outline-none transition-all text-sm bg-white
            ${error
              ? 'border-danger-300 focus:ring-2 focus:ring-danger-500'
              : 'border-neutral-300 focus:ring-2 focus:ring-primary-500'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
```

---

### 11. Barrel Export `src/components/ui/index.ts`

```typescript
export { Button } from './Button'
export { StatusBadge } from './StatusBadge'
export { Modal, ConfirmModal } from './Modal'
export { FileUploadBox } from './FileUploadBox'
export { ProgressBar } from './ProgressBar'
export { EmptyState } from './EmptyState'
export { LoadingSpinner, PageLoading } from './LoadingSpinner'
export { Input } from './Input'
export { Textarea } from './Textarea'
export { Select } from './Select'
```

---

## Cara Menggunakan

```tsx
// Import dari barrel
import { Button, StatusBadge, Modal, Input } from '../components/ui'

// Contoh penggunaan
<Button variant="primary" size="md">Simpan</Button>
<Button variant="danger" isLoading={true}>Hapus</Button>
<StatusBadge variant="success">Aktif</StatusBadge>
<StatusBadge variant="warning">Draft</StatusBadge>
<Input label="Nama" error="Nama wajib diisi" />
```

---

## Kriteria Selesai

- [ ] 10 komponen UI sudah dibuat di `src/components/ui/`
- [ ] Barrel export di `index.ts` sudah lengkap
- [ ] Semua komponen menggunakan design tokens dari theme (bukan hardcoded hex)
- [ ] `npm run dev` berjalan tanpa error
- [ ] Import `{ Button }` dari `'../components/ui'` berfungsi
