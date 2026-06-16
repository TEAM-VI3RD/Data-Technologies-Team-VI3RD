import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!user.is_admin) navigate('/')
  }, [user, navigate])

  if (!user?.is_admin) return null

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive
      ? 'bg-white text-gray-900 shadow-sm'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Admin dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Beheeromgeving</h1>
            <p className="mt-1 text-sm text-gray-500">Schakel tussen producten, bestellingen, gebruikers en retouren.</p>
          </div>

          <nav className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2">
            <NavLink to="/admin/products" className={linkClass}>Producten</NavLink>
            <NavLink to="/admin/orders" className={linkClass}>Bestellingen</NavLink>
            <NavLink to="/admin/users" className={linkClass}>Gebruikers</NavLink>
            <NavLink to="/admin/returns" className={linkClass}>Retouren</NavLink>
            <NavLink to="/admin/payments" className={linkClass}>Betalingen</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
