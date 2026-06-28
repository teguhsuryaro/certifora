// Konstanta aplikasi

export const APP_NAME = 'Certifora'

export const EVENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  TEMPORARILY_CLOSED: 'temporarily_closed',
  PERMANENTLY_CLOSED: 'permanently_closed',
} as const

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

export const TEXT_FORMAT = {
  ORIGINAL: 'original',
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  TITLE_CASE: 'title_case',
} as const

export const QR_POSITION = {
  TOP_LEFT: 'top_left',
  TOP_RIGHT: 'top_right',
  BOTTOM_LEFT: 'bottom_left',
  BOTTOM_RIGHT: 'bottom_right',
} as const

// Batas pengiriman email harian (sisakan buffer 10 dari limit 100 Resend)
export const DAILY_EMAIL_LIMIT = 90

// Ukuran maksimal selfie sebelum kompresi (5 MB)
export const MAX_SELFIE_SIZE_MB = 5

// Format file selfie yang diterima
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
