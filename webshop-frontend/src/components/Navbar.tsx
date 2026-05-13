import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartContext } from '../context/CartContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCartContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sluit mobiel menu bij navigatie
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false) }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/products')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-base font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`

  return (
    <>
      <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-6">

          {/* Logo */}
          <Link to="/products" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">TechCycle</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/products" className={navLinkClass}>Producten</NavLink>
            {user && <NavLink to="/orders" className={navLinkClass}>Bestellingen</NavLink>}
            {user && <NavLink to="/addresses" className={navLinkClass}>Adressen</NavLink>}
            {user?.is_admin && (
              <NavLink to="/admin" className={() => 'text-base font-medium text-purple-400 hover:text-purple-300 transition-colors'}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Winkelwagen */}
                <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors" title="Winkelwagen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Desktop: gebruikersdropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-white uppercase">
                      {user.email[0]}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-800 truncate">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.is_admin ? 'Administrator' : 'Klant'}</p>
                        </div>
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Mijn profiel
                        </Link>
                        <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          Bestellingen
                        </Link>
                        <Link to="/addresses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                          Adressen
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Uitloggen
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobiel: hamburger */}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Menu"
                >
                  {mobileOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">
                  Inloggen
                </Link>
                <Link to="/register" className="text-sm sm:text-base bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors">
                  Registreren
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobiel uitklapmenu */}
        {mobileOpen && user && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-white uppercase shrink-0">
                {user.email[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-gray-400">{user.is_admin ? 'Administrator' : 'Klant'}</p>
              </div>
            </div>
            <nav className="px-2 py-2 flex flex-col">
              {[
                { to: '/products',  label: 'Producten' },
                { to: '/orders',    label: 'Bestellingen' },
                { to: '/addresses', label: 'Adressen' },
                { to: '/profile',   label: 'Mijn profiel' },
                ...(user.is_admin ? [{ to: '/admin', label: 'Admin' }] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {label}
                </Link>
              ))}
              <hr className="my-2 border-gray-800" />
              <button
                onClick={handleLogout}
                className="px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                Uitloggen
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
