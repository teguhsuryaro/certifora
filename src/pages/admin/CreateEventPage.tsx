import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { useAuthStore } from '../../stores/authStore'
import { Button, Input, Textarea } from '../../components/ui'
import type { EventInsert } from '../../types/database'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { createEvent, isLoading } = useEventStore()
  const { admin } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizer: '',
    location: '',
    event_date: '',
    event_time: '',
    prefix: '',
    // Email settings (akan diupdate setelah event dibuat)
    email_subject: 'Sertifikat Anda',
    email_title: 'Sertifikat Kehadiran',
    email_body: 'Terima kasih atas partisipasi Anda. Berikut terlampir sertifikat Anda.',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Nama event wajib diisi'
    if (!formData.organizer.trim()) newErrors.organizer = 'Penyelenggara wajib diisi'
    if (!formData.event_date) newErrors.event_date = 'Tanggal event wajib diisi'
    if (!formData.prefix.trim()) newErrors.prefix = 'Prefix sertifikat wajib diisi'
    if (formData.prefix && !/^[A-Z0-9]+$/i.test(formData.prefix.trim())) {
      newErrors.prefix = 'Prefix hanya boleh huruf dan angka (tanpa spasi)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error saat user mulai mengetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || !admin) return

    try {
      const eventData: EventInsert = {
        admin_id: admin.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        organizer: formData.organizer.trim(),
        location: formData.location.trim() || null,
        event_date: formData.event_date,
        event_time: formData.event_time || null,
        prefix: formData.prefix.trim().toUpperCase(),
      }

      const event = await createEvent(eventData)

      // Update email settings jika diubah dari default
      // (opsional, bisa dilakukan nanti di halaman detail event)

      navigate(`/admin/events/${event.id}`)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Gagal membuat event' })
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Buat Event Baru</h1>
        <p className="text-neutral-500 mt-1">Isi informasi event dan pengaturan email sertifikat</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-600">{errors.submit}</p>
          </div>
        )}

        {/* === Section 1: Informasi Event === */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Informasi Event</h2>
          <div className="space-y-4">
            <Input
              id="name"
              label="Nama Event *"
              placeholder="Contoh: Webinar AI untuk Pendidikan"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />

            <Textarea
              id="description"
              label="Deskripsi"
              placeholder="Deskripsi singkat tentang event..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />

            <Input
              id="organizer"
              label="Penyelenggara *"
              placeholder="Contoh: Fakultas Teknik Universitas X"
              value={formData.organizer}
              onChange={(e) => handleChange('organizer', e.target.value)}
              error={errors.organizer}
            />

            <Input
              id="location"
              label="Lokasi (opsional)"
              placeholder="Contoh: Aula Gedung A / Online via Zoom"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="event_date"
                label="Tanggal Event *"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                error={errors.event_date}
              />
              <Input
                id="event_time"
                label="Waktu (opsional)"
                type="time"
                value={formData.event_time}
                onChange={(e) => handleChange('event_time', e.target.value)}
              />
            </div>

            <Input
              id="prefix"
              label="Prefix Kode Sertifikat *"
              placeholder="Contoh: WEBINARAI"
              value={formData.prefix}
              onChange={(e) => handleChange('prefix', e.target.value.toUpperCase())}
              error={errors.prefix}
              hint="Akan digunakan sebagai prefix kode sertifikat. Contoh: WEBINARAI-7729"
            />
          </div>
        </div>

        {/* === Section 2: Pengaturan Email === */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Pengaturan Email</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Konfigurasi email yang akan dikirim bersama sertifikat. Bisa diubah nanti.
          </p>
          <div className="space-y-4">
            <Input
              id="email_subject"
              label="Subject Email"
              placeholder="Subject email yang diterima peserta"
              value={formData.email_subject}
              onChange={(e) => handleChange('email_subject', e.target.value)}
            />
            <Input
              id="email_title"
              label="Judul Email"
              placeholder="Judul di dalam body email"
              value={formData.email_title}
              onChange={(e) => handleChange('email_title', e.target.value)}
            />
            <Textarea
              id="email_body"
              label="Isi Email"
              placeholder="Isi pesan email..."
              value={formData.email_body}
              onChange={(e) => handleChange('email_body', e.target.value)}
            />
          </div>
        </div>

        {/* === Actions === */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/dashboard')}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Buat Event
          </Button>
        </div>
      </form>
    </div>
  )
}
