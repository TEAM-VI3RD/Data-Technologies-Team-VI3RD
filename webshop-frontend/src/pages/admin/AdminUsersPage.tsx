import { useEffect, useState } from 'react'
import { adminGetUsers, adminBlockUser, adminUnblockUser, adminDeleteUser } from '../../api'
import type { User } from '../../types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetUsers()
      .then((data) => setUsers(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleBlock(id: number) {
    try {
      const updated = await adminBlockUser(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Mislukt')
    }
  }

  async function handleUnblock(id: number) {
    try {
      const updated = await adminUnblockUser(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Mislukt')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Gebruiker verwijderen?')) return
    try {
      await adminDeleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Gebruikers beheren</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Geblokkeerd</th>
              <th className="px-4 py-2">Aangemaakt</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{u.id}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.is_admin ? 'Ja' : '–'}</td>
                <td className="px-4 py-2">
                  {u.blocked ? (
                    <span className="text-red-500 font-medium">Geblokkeerd</span>
                  ) : (
                    <span className="text-green-600">Actief</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('nl-NL')}
                </td>
                <td className="px-4 py-2 flex gap-2 justify-end">
                  {u.blocked ? (
                    <button onClick={() => handleUnblock(u.id)} className="text-green-600 hover:underline">
                      Deblokkeer
                    </button>
                  ) : (
                    <button onClick={() => handleBlock(u.id)} className="text-yellow-600 hover:underline">
                      Blokkeer
                    </button>
                  )}
                  <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:underline">
                    Verwijder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
