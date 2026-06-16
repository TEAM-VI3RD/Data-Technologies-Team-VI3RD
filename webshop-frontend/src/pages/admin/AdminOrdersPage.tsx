import { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api'
import type { Order } from '../../types'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_LABELS: Record<string, string> = {
  pending: 'Bestelling geplaatst',
  confirmed: 'Betaald',
  shipped: 'Verzonden',
  delivered: 'Afgeleverd',
  cancelled: 'Geannuleerd',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    adminGetOrders()
      .then((data) => setOrders(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatus(id: number, status: string) {
    try {
      setSavingId(id)
      await adminUpdateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bijwerken mislukt')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Admin dashboard</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Bestellingen</h1>
          <p className="text-sm text-gray-500 mt-1">Overzicht van alle webshopbestellingen en hun status.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-80">
          <StatCard label="Totaal" value={orders.length.toString()} />
          <StatCard label="Omzet" value={`€${totalRevenue.toFixed(2)}`} />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="font-medium text-gray-700">Nog geen bestellingen gevonden</p>
          <p className="mt-1 text-sm text-gray-500">Zodra klanten bestellen verschijnen ze hier automatisch.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Bestelling</th>
                  <th className="px-4 py-3">Gebruiker</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3 text-right">Totaal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 align-top">
                    <td className="px-4 py-4 font-semibold text-gray-900">#{order.id}</td>
                    <td className="px-4 py-4 text-gray-600">Gebruiker #{order.user_id}</td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('nl-NL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-900">
                      €{order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatus(order.id, e.target.value)}
                          disabled={savingId === order.id}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status] ?? status}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-400">
                          Huidig: {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {(order.items?.length ?? 0)} {(order.items?.length ?? 0) === 1 ? 'product' : 'producten'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}
