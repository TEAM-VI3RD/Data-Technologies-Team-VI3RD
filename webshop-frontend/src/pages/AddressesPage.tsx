import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAddresses, createAddress, deleteAddress } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Address } from '../types'

const emptyForm = {
  full_name: '',
  street: '',
  house_number: '',
  postal_code: '',
  city: '',
  country: 'Nederland',
  type: 'shipping',
}

const TYPE_META: Record<string, { label: string; gradient: string; chip: string; icon: string }> = {
  shipping: {
    label: 'Verzendadres',
    gradient: 'from-blue-500 to-cyan-500',
    chip: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: '🚚',
  },
  billing: {
    label: 'Factuuradres',
    gradient: 'from-purple-500 to-pink-500',
    chip: 'bg-purple-50 text-purple-700 border-purple-100',
    icon: '🧾',
  },
}

export default function AddressesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getAddresses()
      .then((data) => setAddresses(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, navigate])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const addr = await createAddress(form)
      setAddresses((prev) => [...prev, addr])
      setForm(emptyForm)
      setShowForm(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Toevoegen mislukt')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Adres verwijderen?')) return
    setDeleting(id)
    try {
      await deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    } finally {
      setDeleting(null)
    }
  }

  const shippingCount = addresses.filter((a) => a.type === 'shipping').length
  const billingCount = addresses.filter((a) => a.type === 'billing').length

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* === HERO === */}
      <div className="relative overflow-hidden rounded-3xl mb-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl" />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur ring-4 ring-white/20 flex items-center justify-center text-3xl shrink-0">
            📍
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">Mijn adressen</h1>
            <p className="text-sm text-blue-100 mt-1">
              Beheer je verzend- en factuuradressen voor snel afrekenen
            </p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setFormError('') }}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
              showForm
                ? 'bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white'
                : 'bg-white hover:bg-blue-50 text-blue-700'
            }`}
          >
            {showForm ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Annuleren
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Adres toevoegen
              </>
            )}
          </button>
        </div>
      </div>

      {/* === STATS === */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Totaal" value={addresses.length} icon="📦" color="from-gray-700 to-gray-900" />
        <Stat label="Verzendadressen" value={shippingCount} icon="🚚" color="from-blue-500 to-cyan-500" />
        <Stat label="Factuuradressen" value={billingCount} icon="🧾" color="from-purple-500 to-pink-500" />
      </div>

      {/* === FORMULIER === */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 animate-slidedown">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Nieuw adres toevoegen</h2>
              <p className="text-xs text-gray-400">Vul de gegevens hieronder in</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            {/* Type selectie als kaarten */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type adres</label>
              <div className="grid grid-cols-2 gap-3">
                {(['shipping', 'billing'] as const).map((type) => {
                  const m = TYPE_META[type]
                  const active = form.type === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type }))}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        active ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                        <p className="text-[10px] text-gray-400">
                          {type === 'shipping' ? 'Waar bezorgen we?' : 'Waar sturen we de factuur?'}
                        </p>
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Naam */}
            <Input
              label="Volledige naam"
              required
              value={form.full_name}
              onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              placeholder="Bijv. Sami Auoladali"
            />

            {/* Postcode + huisnummer eerst */}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Postcode"
                required
                value={form.postal_code}
                onChange={(v) => setForm((f) => ({ ...f, postal_code: v }))}
                placeholder="1234 AB"
              />
              <Input
                label="Huisnr."
                required
                value={form.house_number}
                onChange={(v) => setForm((f) => ({ ...f, house_number: v }))}
                placeholder="12a"
              />
              <Input
                label="Stad"
                required
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                placeholder="Amsterdam"
              />
            </div>

            <Input
              label="Straatnaam"
              required
              value={form.street}
              onChange={(v) => setForm((f) => ({ ...f, street: v }))}
              placeholder="Voorbeeldstraat"
            />

            <Input
              label="Land"
              required
              value={form.country}
              onChange={(v) => setForm((f) => ({ ...f, country: v }))}
            />

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2.5 text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
                </svg>
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? 'Bezig...' : 'Adres opslaan'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* === LEGE STATE === */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-5 text-4xl">
            🏠
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Nog geen adressen</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Voeg een verzend- of factuuradres toe om je eerste bestelling te plaatsen.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Eerste adres toevoegen
          </button>
        </div>
      )}

      {/* === ADRESLIJST === */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => {
            const meta = TYPE_META[a.type] ?? TYPE_META.shipping
            return (
              <div
                key={a.id}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                {/* Gekleurd lintje bovenaan */}
                <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />

                <div className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-2xl shrink-0 shadow-md`}>
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.chip}`}>
                        {meta.label}
                      </span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                        title="Verwijder adres"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
                        </svg>
                      </button>
                    </div>

                    <p className="font-bold text-gray-900 leading-tight mb-1.5">{a.full_name}</p>
                    <div className="text-sm text-gray-500 leading-relaxed">
                      <p>{a.street} {a.house_number}</p>
                      <p>{a.postal_code} {a.city}</p>
                      <p className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {a.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------- helper componenten ---------- */

function Stat({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, required }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  )
}
