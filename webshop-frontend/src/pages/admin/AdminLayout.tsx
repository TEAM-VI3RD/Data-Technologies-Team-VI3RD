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
    `block px-3 py-2 rounded text-sm ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-48 bg-gray-900 text-white flex-shrink-0 flex flex-col py-6 px-3 gap-1">
        <div className="text-xs uppercase text-gray-500 font-semibold px-3 mb-3">Admin</div>
        <NavLink to="/admin/products" className={linkClass}>Producten</NavLink>
        <NavLink to="/admin/orders" className={linkClass}>Bestellingen</NavLink>
        <NavLink to="/admin/users" className={linkClass}>Gebruikers</NavLink>
        <NavLink to="/admin/returns" className={linkClass}>Retouren</NavLink>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
