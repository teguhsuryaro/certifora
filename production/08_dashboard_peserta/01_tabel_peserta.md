# 01 — Dashboard Tabel Peserta

> **Prasyarat:** Form registrasi peserta sudah selesai (folder `07_registrasi_peserta` selesai).
> **File target:** `src/pages/admin/ParticipantsPage.tsx`

---

## Tujuan

Mengimplementasikan dashboard peserta dengan:
- Tabel data peserta (desktop) / card list (mobile)
- Search & filter status pengiriman
- Tombol "Kirim Semua"
- Aksi per peserta: preview, kirim, kirim ulang
- Sticky header tabel

---

## Implementasi `src/pages/admin/ParticipantsPage.tsx`

```typescript
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as participantService from '../../services/participantService'
import { supabase } from '../../lib/supabase'
import { Button, StatusBadge, EmptyState, PageLoading, Input } from '../../components/ui'
import type { DeliveryStatus } from '../../types/database'

function getDeliveryBadge(status: DeliveryStatus) {
  const map: Record<DeliveryStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
    pending: { variant: 'warning', label: 'Belum Dikirim' },
    success: { variant: 'success', label: 'Berhasil' },
    failed: { variant: 'danger', label: 'Gagal' },
  }
  return map[status]
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Belum Dikirim' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
]

export default function ParticipantsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (eventId) loadParticipants()
  }, [eventId])

  const loadParticipants = async () => {
    setIsLoading(true)
    try {
      const data = await participantService.fetchParticipants(eventId!)
      setParticipants(data || [])
    } catch (error) {
      console.error('Failed to load participants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter & search
  const filteredParticipants = participants.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.delivery_status === statusFilter
    const matchesSearch = searchQuery === '' ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.certificate_code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingCount = participants.filter(p => p.delivery_status === 'pending').length
  const successCount = participants.filter(p => p.delivery_status === 'success').length
  const failedCount = participants.filter(p => p.delivery_status === 'failed').length

  // Get selfie URL
  const getSelfieUrl = (selfiePath: string | null) => {
    if (!selfiePath) return null
    const { data } = supabase.storage.from('selfies').getPublicUrl(selfiePath)
    return data?.publicUrl || null
  }

  if (isLoading) return <PageLoading />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Peserta</h1>
          <p className="text-neutral-500 mt-1">
            {participants.length} peserta • {successCount} terkirim • {pendingCount} belum • {failedCount} gagal
          </p>
        </div>
        <Link to={`/admin/events/${eventId}/participants`}>
          {/* Tombol Kirim Semua - implementasi di folder 10 */}
          <Button
            variant="primary"
            disabled={pendingCount === 0}
          >
            Kirim Semua ({pendingCount})
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Cari nama, email, atau kode sertifikat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${statusFilter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Belum ada peserta"
          description={
            participants.length === 0
              ? 'Peserta akan muncul di sini setelah mendaftar via QR code'
              : 'Tidak ada peserta yang sesuai dengan filter'
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Peserta</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Selfie</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Kode</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Tanggal</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredParticipants.map((p) => {
                    const badge = getDeliveryBadge(p.delivery_status)
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-neutral-900">{p.full_name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{p.email}</td>
                        <td className="px-4 py-3">
                          {p.selfie_path ? (
                            <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                              <img
                                src={getSelfieUrl(p.selfie_path) || ''}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-neutral-600">{p.certificate_code}</td>
                        <td className="px-4 py-3 text-sm text-neutral-500">
                          {new Date(p.submitted_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/events/${eventId}/participants/${p.id}`}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredParticipants.map((p) => {
              const badge = getDeliveryBadge(p.delivery_status)
              return (
                <Link
                  key={p.id}
                  to={`/admin/events/${eventId}/participants/${p.id}`}
                  className="block bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-card transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                      {p.selfie_path && (
                        <img
                          src={getSelfieUrl(p.selfie_path) || ''}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-neutral-900 truncate">{p.full_name}</h3>
                        <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                      </div>
                      <p className="text-sm text-neutral-500 truncate">{p.email}</p>
                      <p className="text-xs text-neutral-400 font-mono mt-1">{p.certificate_code}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
```

---

## Kriteria Selesai

- [ ] Tabel peserta tampil di desktop dengan semua kolom
- [ ] Card list tampil di mobile dengan info ringkas
- [ ] Search berfungsi (nama, email, kode)
- [ ] Filter status berfungsi (Semua/Belum/Berhasil/Gagal)
- [ ] Badge status berwarna sesuai
- [ ] Thumbnail selfie tampil (avatar bulat)
- [ ] Klik row/card mengarah ke detail peserta
- [ ] Ringkasan jumlah peserta tampil di header
- [ ] Sticky header tabel di desktop
- [ ] Empty state tampil jika belum ada peserta
