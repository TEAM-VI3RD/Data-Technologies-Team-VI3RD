import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPayments } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Payment, PaymentMethod, PaymentStatus } from '../types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card:   'Creditcard',
  debit_card:    'Debitcard',
  paypal:        'PayPal',
  ideal:         'iDEAL',
  bank_transfer: 'Bankoverschrijving',
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; dot: string }> = {
  pending:  { label: 'In afwachting', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', dot: 'bg-yellow-400' },
  paid:     { label: 'Betaald',        color: 'bg-green-50 text-green-700 border-green-100',   dot: 'bg-green-400' },
  failed:   { label: 'Mislukt',        color: 'bg-red-50 text-red-700 border-red-100',         dot: 'bg-red-400' },
  refunded: { label: 'Terugbetaald',   color: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-400' },
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getPayments()
      .then((data) => setPayments(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-100 rounded w-40 mb-6" />
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
        <h1 className="text-xl font-bold text-gray-900">Mijn betalingen</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {payments.length === 0 ? 'Nog geen betalingen' : `${payments.length} betaling${payments.length !== 1 ? 'en' : ''}`}
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Geen betalingen gevonden</p>
          <p className="text-sm text-gray-400 mb-5">Betalingen worden aangemaakt via jouw bestellingen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Bestelling #{p.order_id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{METHOD_LABELS[p.method] ?? p.method}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {p.transaction_id && (
                      <p className="text-xs text-gray-300 mt-0.5 font-mono">ID: {p.transaction_id}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <PaymentStatusBadge status={p.status} />
                  <span className="text-sm font-bold text-gray-900">€{p.amount.toFixed(2)}</span>
                  {p.paid_at && (
                    <span className="text-xs text-gray-400">
                      Betaald op {new Date(p.paid_at).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
