import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DevNotice from '../components/DevNotice'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) { navigate('/login'); return null }

  function handleLogout() {
    logout()
    navigate('/products')
  }

  const memberSince = new Date(user.created_at).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mijn profiel</h1>

      {/* Avatar + info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white uppercase shrink-0">
          {user.email[0]}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.email}</p>
          <p className="text-sm text-gray-400 mt-0.5">Lid sinds {memberSince}</p>
          <div className="flex items-center gap-2 mt-2">
            {user.is_admin && (
              <span className="text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
            <span className="text-xs font-semibold bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
              Actief
            </span>
          </div>
        </div>
      </div>

      {/* Nog niet geïmplementeerd */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Accountinstellingen</h2>
        <DevNotice feature="E-mailadres wijzigen" />
        <DevNotice feature="Wachtwoord wijzigen" />
      </div>

      {/* Snelkoppelingen */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
        <h2 className="text-sm font-semibold text-gray-700 px-6 pt-5 pb-3">Mijn account</h2>
        {[
          { to: '/orders',    icon: orderIcon,   label: 'Bestellingen',  sub: 'Bekijk je bestelhistorie' },
          { to: '/addresses', icon: addressIcon, label: 'Adressen',      sub: 'Beheer je verzend- en factuuradres' },
          { to: '/cart',      icon: cartIcon,    label: 'Winkelwagen',   sub: 'Bekijk je huidige winkelwagen' },
        ].map(({ to, icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 px-6 py-4 border-t border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-400">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-300 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Uitloggen */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-2xl px-6 py-4 text-sm font-medium transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Uitloggen
      </button>
    </div>
  )
}

const orderIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const addressIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)
const cartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
  </svg>
)
