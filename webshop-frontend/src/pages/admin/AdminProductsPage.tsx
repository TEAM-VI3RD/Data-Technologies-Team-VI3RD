import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api'
import type { Product } from '../../types'

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  active: true,
  category_ids: [] as number[],
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Laden mislukt')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stock: p.stock,
      active: p.active,
      category_ids: p.category_ids ?? [],
    })
    setShowForm(true)
  }

  function startNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, form)
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)))
      } else {
        const created = await createProduct(form)
        setProducts((prev) => [...prev, created])
      }
      setShowForm(false)
      setEditing(null)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Product verwijderen?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Producten beheren</h1>
        <button onClick={startNew} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">
          + Nieuw product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-3">
          <h2 className="col-span-2 font-medium text-gray-700">{editing ? 'Product bewerken' : 'Nieuw product'}</h2>
          {([
            ['name', 'Naam', 'text', 2],
            ['description', 'Beschrijving', 'text', 2],
            ['price', 'Prijs (€)', 'number', 1],
            ['stock', 'Voorraad', 'number', 1],
          ] as [keyof typeof emptyForm, string, string, number][]).map(([key, label, type, span]) => (
            <div key={key} className={span === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
              <input
                type={type}
                step={type === 'number' ? 'any' : undefined}
                required={key === 'name'}
                value={form[key] as string | number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              id="active"
            />
            <label htmlFor="active" className="text-sm text-gray-600">Actief</label>
          </div>
          {formError && <p className="col-span-2 text-red-600 text-sm">{formError}</p>}
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">
              Opslaan
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
            >
              Annuleren
            </button>
          </div>
        </form>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Naam</th>
              <th className="px-4 py-2 text-right">Prijs</th>
              <th className="px-4 py-2 text-right">Voorraad</th>
              <th className="px-4 py-2">Actief</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{p.id}</td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-right">€{p.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{p.stock}</td>
                <td className="px-4 py-2">{p.active ? '✓' : '–'}</td>
                <td className="px-4 py-2 flex gap-2 justify-end">
                  <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline">Bewerk</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">Verwijder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
