import { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api'
import type { Order } from '../../types'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetOrders()
      .then((data) => setOrders(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatus(id: number, status: string) {
    try {
      await adminUpdateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bijwerken mislukt')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Bestellingen beheren</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Gebruiker</th>
              <th className="px-4 py-2 text-right">Totaal</th>
              <th className="px-4 py-2">Datum</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{o.id}</td>
                <td className="px-4 py-2">{o.user_id}</td>
                <td className="px-4 py-2 text-right">€{o.total_amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(o.created_at).toLocaleDateString('nl-NL')}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatus(o.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
