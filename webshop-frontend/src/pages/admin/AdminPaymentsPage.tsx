import { useEffect, useState } from 'react'
import { adminGetPayments, adminUpdatePaymentStatus } from '../../api'
import type { Payment, PaymentMethod, PaymentStatus } from '../../types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card:   'Creditcard',
  debit_card:    'Debitcard',
  paypal:        'PayPal',
  ideal:         'iDEAL',
  bank_transfer: 'Bankoverschrijving',
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending:  { label: 'In afwachting', color: 'bg-yellow-50 text-yellow-700' },
  paid:     { label: 'Betaald',        color: 'bg-green-50 text-green-700'  },
  failed:   { label: 'Mislukt',        color: 'bg-red-50 text-red-700'      },
  refunded: { label: 'Terugbetaald',   color: 'bg-purple-50 text-purple-700' },
}

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-50 text-gray-600' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetPayments()
      .then((data) => setPayments(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatus(id: string, status: PaymentStatus) {
    try {
      // Zet paid_at automatisch als status naar 'paid' gaat
      const paid_at = status === 'paid' ? new Date().toISOString() : undefined
      await adminUpdatePaymentStatus(id, status, paid_at)
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status, paid_at: paid_at ?? p.paid_at }
            : p
        )
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bijwerken mislukt')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error)   return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Betalingen beheren</h1>
        <span className="text-sm text-gray-400">{payments.length} betaling{payments.length !== 1 ? 'en' : ''}</span>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
          Nog geen betalingen in het systeem.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2">Bestelling</th>
                <th className="px-4 py-2">Gebruiker</th>
                <th className="px-4 py-2">Methode</th>
                <th className="px-4 py-2 text-right">Bedrag</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Datum</th>
                <th className="px-4 py-2">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700 font-medium">#{p.order_id}</td>
                  <td className="px-4 py-2 text-gray-500">{p.user_id}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {METHOD_LABELS[p.method] ?? p.method}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-700">
                    €{p.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2 text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatus(p.id, e.target.value as PaymentStatus)}
                      className="border border-gray-300 rounded px-2 py-0.5 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
