import { useEffect, useState } from 'react'
import { adminGetReturns, adminUpdateReturnStatus } from '../../api'
import type { Return } from '../../types'

const STATUSES = ['pending', 'approved', 'rejected', 'completed']

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetReturns()
      .then((data) => setReturns(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatus(id: number, status: string) {
    try {
      await adminUpdateReturnStatus(id, status)
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bijwerken mislukt')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Retouren beheren</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Bestelling</th>
              <th className="px-4 py-2">Gebruiker</th>
              <th className="px-4 py-2">Reden</th>
              <th className="px-4 py-2">Aangevraagd</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {returns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-gray-400 text-center">
                  Geen retourverzoeken.
                </td>
              </tr>
            )}
            {returns.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{r.id}</td>
                <td className="px-4 py-2">{r.order_id}</td>
                <td className="px-4 py-2">{r.user_id}</td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{r.reason || '–'}</td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(r.requested_at).toLocaleDateString('nl-NL')}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatus(r.id, e.target.value)}
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
