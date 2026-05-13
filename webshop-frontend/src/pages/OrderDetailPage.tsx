import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getOrder, createReturn } from '../api'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge } from './OrdersPage'
import type { Order } from '../types'

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [returnStatus, setReturnStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [returnMsg, setReturnMsg] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!id) return
    getOrder(Number(id))
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  async function handleReturn() {
    if (!order) return
    try {
      await createReturn(order.id, returnReason)
      setReturnStatus('done')
      setReturnMsg('Je retourverzoek is ingediend. We nemen zo snel mogelijk contact op.')
      setReturnReason('')
    } catch (err: unknown) {
      setReturnStatus('error')
      setReturnMsg(err instanceof Error ? err.message : 'Indienen mislukt')
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded w-36" />
        <div className="h-8 bg-gray-100 rounded w-64" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  if (!order) return null

  const isCancelled = order.status === 'cancelled'
  const activeStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/orders" className="hover:text-blue-600 transition-colors">Bestellingen</Link>
        <span>/</span>
        <span className="text-gray-600">#{order.id}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bestelling #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Geplaatst op {new Date(order.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Voortgangsbalk */}
      {!isCancelled && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 mx-8" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-blue-500 mx-8 transition-all"
              style={{ width: activeStep <= 0 ? '0%' : `${(activeStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, i) => {
              const done = i < activeStep
              const current = i === activeStep
              return (
                <div key={step} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done    ? 'bg-blue-500 border-blue-500' :
                    current ? 'bg-white border-blue-500' :
                              'bg-white border-gray-200'
                  }`}>
                    {done ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`w-2.5 h-2.5 rounded-full ${current ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium text-center leading-tight ${current ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step === 'pending'   && 'In behandeling'}
                    {step === 'confirmed' && 'Bevestigd'}
                    {step === 'shipped'   && 'Verzonden'}
                    {step === 'delivered' && 'Afgeleverd'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 text-sm text-red-600 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
          </svg>
          Deze bestelling is geannuleerd.
        </div>
      )}

      {/* Productenlijst */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Producten</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">€{item.unit_price.toFixed(2)} × {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700 shrink-0">€{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Totaal</span>
          <span className="text-base font-bold text-gray-900">€{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Retour aanvragen */}
      {order.status === 'delivered' && returnStatus !== 'done' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-700">Retour aanvragen</h2>
          </div>
          <textarea
            placeholder="Omschrijf de reden voor het retour (optioneel)"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {returnStatus === 'error' && (
            <p className="text-sm text-red-500 mb-3">{returnMsg}</p>
          )}
          <button
            onClick={handleReturn}
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Retour indienen
          </button>
        </div>
      )}

      {returnStatus === 'done' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-500 shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-700">Retourverzoek ingediend</p>
            <p className="text-xs text-green-600 mt-0.5">{returnMsg}</p>
          </div>
        </div>
      )}
    </div>
  )
}
