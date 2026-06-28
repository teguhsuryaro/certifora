# 05 — TypeScript Types untuk Database

> **Prasyarat:** Skema database sudah dibuat (file `02_skema_database.md` sudah selesai).
> **File target:** `src/types/database.ts`

---

## Tujuan

Membuat TypeScript type definitions yang sesuai dengan skema database Supabase, untuk type-safety di seluruh aplikasi.

---

## Isi File `src/types/database.ts`

```typescript
// ============================================================
// Supabase Database Types untuk Certifora
// ============================================================

// --- Enum Types ---

export type EventStatus = 'draft' | 'active' | 'temporarily_closed' | 'permanently_closed'
export type QrPosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right'
export type TextFormat = 'original' | 'uppercase' | 'lowercase' | 'title_case'
export type DeliveryStatus = 'pending' | 'success' | 'failed'

// --- Table Row Types ---

export interface Admin {
  id: string
  auth_id: string
  full_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  admin_id: string
  name: string
  description: string | null
  organizer: string
  location: string | null
  event_date: string
  event_time: string | null
  prefix: string
  status: EventStatus
  created_at: string
  updated_at: string
}

export interface EventEmailSettings {
  id: string
  event_id: string
  subject: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export interface CertificateTemplate {
  id: string
  event_id: string
  template_file_path: string | null
  template_file_name: string | null
  name_position_x: number
  name_position_y: number
  name_font_size: number
  name_font_color: string
  name_font_family: string
  name_text_format: TextFormat
  qr_position: QrPosition
  qr_size: number
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  event_id: string
  full_name: string
  email: string
  selfie_path: string | null
  certificate_code: string
  delivery_status: DeliveryStatus
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface TemplateOverride {
  id: string
  participant_id: string
  name_position_x: number | null
  name_position_y: number | null
  name_font_size: number | null
  created_at: string
  updated_at: string
}

export interface DeliveryLog {
  id: string
  participant_id: string
  status: DeliveryStatus
  error_message: string | null
  sent_at: string
}

export interface CertificateCode {
  id: string
  code: string
  participant_id: string
  event_id: string
  created_at: string
}

export interface EventStatusHistory {
  id: string
  event_id: string
  old_status: EventStatus | null
  new_status: EventStatus
  changed_by: string | null
  changed_at: string
}

// --- Insert Types (untuk operasi INSERT, tanpa kolom auto-generated) ---

export interface EventInsert {
  admin_id: string
  name: string
  description?: string | null
  organizer: string
  location?: string | null
  event_date: string
  event_time?: string | null
  prefix: string
  status?: EventStatus
}

export interface EventEmailSettingsInsert {
  event_id: string
  subject?: string
  title?: string
  body?: string
}

export interface CertificateTemplateInsert {
  event_id: string
  template_file_path?: string | null
  template_file_name?: string | null
  name_position_x?: number
  name_position_y?: number
  name_font_size?: number
  name_font_color?: string
  name_font_family?: string
  name_text_format?: TextFormat
  qr_position?: QrPosition
  qr_size?: number
}

export interface ParticipantInsert {
  event_id: string
  full_name: string
  email: string
  selfie_path?: string | null
  certificate_code: string
  delivery_status?: DeliveryStatus
}

export interface TemplateOverrideInsert {
  participant_id: string
  name_position_x?: number | null
  name_position_y?: number | null
  name_font_size?: number | null
}

export interface DeliveryLogInsert {
  participant_id: string
  status: DeliveryStatus
  error_message?: string | null
}

export interface CertificateCodeInsert {
  code: string
  participant_id: string
  event_id: string
}

export interface EventStatusHistoryInsert {
  event_id: string
  old_status?: EventStatus | null
  new_status: EventStatus
  changed_by?: string | null
}

// --- Update Types (Partial, tanpa kolom yang tidak boleh diupdate) ---

export interface EventUpdate {
  name?: string
  description?: string | null
  organizer?: string
  location?: string | null
  event_date?: string
  event_time?: string | null
  prefix?: string
  status?: EventStatus
}

export interface EventEmailSettingsUpdate {
  subject?: string
  title?: string
  body?: string
}

export interface CertificateTemplateUpdate {
  template_file_path?: string | null
  template_file_name?: string | null
  name_position_x?: number
  name_position_y?: number
  name_font_size?: number
  name_font_color?: string
  name_font_family?: string
  name_text_format?: TextFormat
  qr_position?: QrPosition
  qr_size?: number
}

export interface ParticipantUpdate {
  full_name?: string
  email?: string
  selfie_path?: string | null
  delivery_status?: DeliveryStatus
}

export interface TemplateOverrideUpdate {
  name_position_x?: number | null
  name_position_y?: number | null
  name_font_size?: number | null
}

// --- Supabase Database Type (untuk createClient<Database>) ---

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: Admin
        Insert: Omit<Admin, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Admin, 'id' | 'created_at' | 'updated_at'>>
      }
      events: {
        Row: Event
        Insert: EventInsert
        Update: EventUpdate
      }
      event_email_settings: {
        Row: EventEmailSettings
        Insert: EventEmailSettingsInsert
        Update: EventEmailSettingsUpdate
      }
      certificate_templates: {
        Row: CertificateTemplate
        Insert: CertificateTemplateInsert
        Update: CertificateTemplateUpdate
      }
      participants: {
        Row: Participant
        Insert: ParticipantInsert
        Update: ParticipantUpdate
      }
      template_overrides: {
        Row: TemplateOverride
        Insert: TemplateOverrideInsert
        Update: TemplateOverrideUpdate
      }
      delivery_logs: {
        Row: DeliveryLog
        Insert: DeliveryLogInsert
        Update: never
      }
      certificate_codes: {
        Row: CertificateCode
        Insert: CertificateCodeInsert
        Update: never
      }
      event_status_history: {
        Row: EventStatusHistory
        Insert: EventStatusHistoryInsert
        Update: never
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      event_status: EventStatus
      qr_position: QrPosition
      text_format: TextFormat
      delivery_status: DeliveryStatus
    }
  }
}
```

---

## Verifikasi

Jalankan:

```bash
npx tsc --noEmit
```

Pastikan tidak ada TypeScript error terkait file types ini.

---

## Kriteria Selesai

- [ ] File `src/types/database.ts` berisi semua type definitions
- [ ] Types sesuai dengan skema database yang sudah dibuat
- [ ] `npx tsc --noEmit` tidak menampilkan error terkait file ini
- [ ] Supabase client di `src/lib/supabase.ts` sudah menggunakan `Database` type
