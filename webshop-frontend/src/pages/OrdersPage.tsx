import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getOrders } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Order } from '../types'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: 'In behandeling', color: 'bg-yellow-50 text-yellow-700 border-yellow-100',  dot: 'bg-yellow-400' },
  confirmed: { label: 'Bevestigd',      color: 'bg-blue-50 text-blue-700 border-blue-100',        dot: 'bg-blue-400' },
  shipped:   { label: 'Verzonden',      color: 'bg-purple-50 text-purple-700 border-purple-100',  dot: 'bg-purple-400' },
  delivered: { label: 'Afgeleverd',     color: 'bg-green-50 text-green-700 border-green-100',     dot: 'bg-green-400' },
  cancelled: { label: 'Geannuleerd',    color: 'bg-red-50 text-red-700 border-red-100',           dot: 'bg-red-400' },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getOrders()
      .then((data) => setOrders(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-100 rounded w-48 mb-6" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mijn bestellingen</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {orders.length === 0 ? 'Nog geen bestellingen' : `${orders.length} bestelling${orders.length !== 1 ? 'en' : ''}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Geen bestellingen gevonden</p>
          <p className="text-sm text-gray-400 mb-5">Je hebt nog niets besteld.</p>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Ga winkelen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Bestelling #{o.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(o.items?.length ?? 0)} {(o.items?.length ?? 0) === 1 ? 'product' : 'producten'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <OrderStatusBadge status={o.status} />
                  <span className="text-sm font-bold text-gray-900">€{o.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
