import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventStore } from '../../stores/eventStore'
import { useAuthStore } from '../../stores/authStore'
import { Button, Input, Textarea } from '../../components/ui'
import { Tag, Building2, Calendar, Clock, MapPin, Hash, Plus, Mail, Type, FileText, ArrowLeft, Info } from 'lucide-react'
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
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Buat Event Baru</h1>
          <p className="text-neutral-500 mt-1">Lengkapi informasi dasar event untuk mulai menerima peserta.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3">
            <Info size={20} className="text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-danger-700">{errors.submit}</p>
          </div>
        )}

        <div className="glass-card p-6 md:p-8 space-y-10">
          
          {/* === Section 1: Informasi Dasar === */}
          <section>
            <div className="flex items-center gap-3 pb-3 mb-6 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Tag size={18} />
              </div>
              <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Informasi Dasar</h2>
            </div>
            
            <div className="space-y-5">
              <Input
                id="name"
                label="Nama Event *"
                icon={<Tag size={18} />}
                placeholder="Contoh: Webinar AI untuk Pendidikan"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
              />

              <Input
                id="organizer"
                label="Penyelenggara *"
                icon={<Building2 size={18} />}
                placeholder="Contoh: Fakultas Teknik Universitas X"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                error={errors.organizer}
              />

              <Textarea
                id="description"
                label="Deskripsi Event"
                placeholder="Jelaskan secara singkat mengenai event ini..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </section>

          {/* === Section 2: Waktu & Lokasi === */}
          <section>
            <div className="flex items-center gap-3 pb-3 mb-6 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Waktu & Lokasi</h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  id="event_date"
                  label="Tanggal Event *"
                  type="date"
                  icon={<Calendar size={18} />}
                  value={formData.event_date}
                  onChange={(e) => handleChange('event_date', e.target.value)}
                  error={errors.event_date}
                />
                <Input
                  id="event_time"
                  label="Waktu (opsional)"
                  type="time"
                  icon={<Clock size={18} />}
                  value={formData.event_time}
                  onChange={(e) => handleChange('event_time', e.target.value)}
                />
              </div>

              <Input
                id="location"
                label="Lokasi Event (opsional)"
                icon={<MapPin size={18} />}
                placeholder="Contoh: Aula Gedung A / Online via Zoom"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </section>

          {/* === Section 3: Pengaturan Sertifikat & Kode === */}
          <section>
            <div className="flex items-center gap-3 pb-3 mb-6 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Hash size={18} />
              </div>
              <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Sertifikat & Identifikasi</h2>
            </div>

            <div className="space-y-5">
              <Input
                id="prefix"
                label="Prefix Kode Sertifikat *"
                icon={<Hash size={18} />}
                placeholder="Contoh: WEBINARAI"
                value={formData.prefix}
                onChange={(e) => handleChange('prefix', e.target.value.toUpperCase())}
                error={errors.prefix}
                hint="Setiap peserta akan mendapatkan kode unik. Contoh jika prefix WEBINARAI, kode akan menjadi WEBINARAI-7729."
              />
            </div>
          </section>

          {/* === Section 4: Pengaturan Template Email Default === */}
          <section>
            <div className="flex items-center gap-3 pb-3 mb-6 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Template Email Default</h2>
            </div>
            
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Teks ini akan digunakan saat mengirimkan sertifikat ke peserta via email. Anda dapat mengubahnya kapan saja melalui pengaturan event.
            </p>

            <div className="space-y-5">
              <Input
                id="email_subject"
                label="Subject Email"
                icon={<Mail size={18} />}
                placeholder="Subject email yang diterima peserta"
                value={formData.email_subject}
                onChange={(e) => handleChange('email_subject', e.target.value)}
              />
              <Input
                id="email_title"
                label="Judul Header di Dalam Email"
                icon={<Type size={18} />}
                placeholder="Judul tebal di dalam body email"
                value={formData.email_title}
                onChange={(e) => handleChange('email_title', e.target.value)}
              />
              <Textarea
                id="email_body"
                label="Isi Pesan Email"
                placeholder="Isi pesan email..."
                value={formData.email_body}
                onChange={(e) => handleChange('email_body', e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* === Actions === */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-neutral-200/50">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto h-12 px-6"
            onClick={() => navigate('/admin/dashboard')}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full sm:w-auto h-12 px-8 font-semibold shadow-md"
            icon={!isLoading ? <Plus size={18} /> : undefined}
          >
            Simpan & Buat Event
          </Button>
        </div>
      </form>
    </div>
  )
}
