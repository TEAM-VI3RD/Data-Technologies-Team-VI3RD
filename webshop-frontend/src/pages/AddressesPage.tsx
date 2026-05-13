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
  country: '',
  type: 'shipping',
}

const TYPE_LABEL: Record<string, string> = {
  shipping: 'Verzendadres',
  billing: 'Factuuradres',
}

const TYPE_COLOR: Record<string, string> = {
  shipping: 'bg-blue-50 text-blue-600 border-blue-100',
  billing: 'bg-purple-50 text-purple-600 border-purple-100',
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
    try {
      const addr = await createAddress(form)
      setAddresses((prev) => [...prev, addr])
      setForm(emptyForm)
      setShowForm(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Toevoegen mislukt')
    }
  }

  async function handleDelete(id: number) {
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

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mijn adressen</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {addresses.length === 0 ? 'Nog geen adressen opgeslagen' : `${addresses.length} adres${addresses.length !== 1 ? 'sen' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError('') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showForm
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {showForm ? (
            'Annuleren'
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adres toevoegen
            </>
          )}
        </button>
      </div>

      {/* Formulier */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Nieuw adres</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            {([
              ['full_name',    'Volledige naam', 2],
              ['street',       'Straat',         1],
              ['house_number', 'Huisnummer',     1],
              ['postal_code',  'Postcode',        1],
              ['city',         'Stad',            1],
              ['country',      'Land',            1],
            ] as [keyof typeof emptyForm, string, number][]).map(([key, label, span]) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input
                  type="text"
                  required
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="shipping">Verzendadres</option>
                <option value="billing">Factuuradres</option>
              </select>
            </div>

            {formError && (
              <p className="col-span-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="col-span-2 flex gap-3 pt-1">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Opslaan
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lege state */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Geen adressen opgeslagen</p>
          <p className="text-sm text-gray-400 mb-5">Voeg een adres toe om te kunnen bestellen.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Eerste adres toevoegen
          </button>
        </div>
      )}

      {/* Adressenlijst */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icoon */}
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{a.full_name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_COLOR[a.type] ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {TYPE_LABEL[a.type] ?? a.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {a.street} {a.house_number}<br />
                    {a.postal_code} {a.city}<br />
                    {a.country}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(a.id)}
                disabled={deleting === a.id}
                className="shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                title="Verwijder adres"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
