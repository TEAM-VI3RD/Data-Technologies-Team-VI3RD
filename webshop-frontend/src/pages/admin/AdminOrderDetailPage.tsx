import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminGetOrder } from '../../api'
import type { Order } from '../../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Bestelling geplaatst',
  confirmed: 'Betaald',
  shipped: 'Verzonden',
  delivered: 'Afgeleverd',
  cancelled: 'Geannuleerd',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const orderId = Number(id)
    if (!id || Number.isNaN(orderId)) {
      setError('Ongeldig bestelnummer')
      setLoading(false)
      return
    }

    adminGetOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-sm text-gray-500">Laden...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!order) return <p className="text-sm text-gray-500">Bestelling niet gevonden.</p>

  const itemCount = order.item_count ?? order.items?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Terug naar bestellingen
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Bestelling #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gebruiker #{order.user_id} - {new Date(order.created_at).toLocaleDateString('nl-NL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SummaryPill label="Status" value={STATUS_LABELS[order.status] ?? order.status} />
          <SummaryPill label="Producten" value={String(itemCount)} />
          <SummaryPill label="Totaal" value={`EUR ${order.total_amount.toFixed(2)}`} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Bestelde producten</h2>
        </div>

        {(order.items ?? []).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">Geen producten gevonden</p>
            <p className="mt-1 text-sm text-gray-500">Deze order heeft geen orderregels in de response.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 text-right">Aantal</th>
                  <th className="px-5 py-3 text-right">Stukprijs</th>
                  <th className="px-5 py-3 text-right">Subtotaal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">Product #{item.product_id}</p>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-5 py-4 text-right text-gray-600">EUR {item.unit_price.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">EUR {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-5 py-4 text-right font-semibold text-gray-700">Totaal</td>
                  <td className="px-5 py-4 text-right text-base font-bold text-gray-900">EUR {order.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
    </div>
  )
}
