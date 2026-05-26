import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartContext } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCartContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  // Sluit menus + reset zoekveld bij navigatie
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  // Vul zoekveld als je op /products bent met ?q=...
  useEffect(() => {
    if (location.pathname === '/products') {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') ?? '')
    } else {
      setQuery('')
    }
  }, [location.pathname, location.search])

  function handleLogout() {
    logout()
    navigate('/products')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
      isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
    }`

  return (
    <header className="bg-gray-950 sticky top-0 z-50 shadow-lg shadow-black/20">
      {/* === BOVENSTE RIJ === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6 h-16 sm:h-20">

          {/* Mobiel: hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>

          {/* Logo */}
          <Link to="/products" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6 text-white" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
              </svg>
            </div>
            <span className="font-bold text-white text-base sm:text-xl tracking-tight">TechCycle</span>
          </Link>

          {/* Zoekbalk (desktop) */}
          <form ref={formRef} onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative flex w-full group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek naar producten, merken en meer..."
                className="flex-1 bg-white text-gray-800 placeholder-gray-400 pl-12 pr-32 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Zoeken
              </button>
            </div>
          </form>

          {/* Rechtse acties */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Account dropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {user.email[0]}
                    </div>
                    <div className="text-left hidden lg:block leading-tight">
                      <div className="text-[10px] text-gray-400">Hallo,</div>
                      <div className="text-xs font-semibold">{user.email.split('@')[0]}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-800 truncate">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.is_admin ? 'Administrator' : 'Klant'}</p>
                        </div>
                        <DropdownLink to="/profile" onClose={() => setDropdownOpen(false)} icon="user">Mijn profiel</DropdownLink>
                        <DropdownLink to="/orders" onClose={() => setDropdownOpen(false)} icon="orders">Bestellingen</DropdownLink>
                        <DropdownLink to="/addresses" onClose={() => setDropdownOpen(false)} icon="address">Adressen</DropdownLink>
                        {user.is_admin && <DropdownLink to="/admin" onClose={() => setDropdownOpen(false)} icon="admin">Admin paneel</DropdownLink>}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Uitloggen
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Cart */}
                <Link to="/cart" className="relative flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                  <div className="relative">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold">Winkelwagen</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Inloggen
                </Link>
                <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Registreer
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Zoekbalk (mobiel) */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek producten..."
              className="w-full bg-white text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      {/* === ONDERSTE RIJ — navigatie (bol.com-stijl) === */}
      <div className="hidden md:block bg-gray-900/70 border-t border-gray-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-1">
          <NavLink to="/products" className={navLinkClass} end>
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Alle producten
            </span>
          </NavLink>
          {user && <NavLink to="/orders" className={navLinkClass}>Bestellingen</NavLink>}
          {user && <NavLink to="/addresses" className={navLinkClass}>Adressen</NavLink>}
          {user && <NavLink to="/profile" className={navLinkClass}>Profiel</NavLink>}
          {user?.is_admin && (
            <NavLink to="/admin" className={() => 'text-sm font-medium px-3 py-2 rounded-lg text-purple-300 hover:text-purple-200 hover:bg-gray-800/70 transition-colors ml-auto'}>
              ⚙ Admin
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobiel uitklapmenu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950">
          {user && (
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
                {user.email[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-gray-400">{user.is_admin ? 'Administrator' : 'Klant'}</p>
              </div>
            </div>
          )}
          <nav className="px-2 py-2 flex flex-col">
            <MobileLink to="/products">Producten</MobileLink>
            {user && <MobileLink to="/orders">Bestellingen</MobileLink>}
            {user && <MobileLink to="/addresses">Adressen</MobileLink>}
            {user && <MobileLink to="/profile">Mijn profiel</MobileLink>}
            {user && <MobileLink to="/cart">Winkelwagen{cartCount > 0 && ` (${cartCount})`}</MobileLink>}
            {user?.is_admin && <MobileLink to="/admin">⚙ Admin paneel</MobileLink>}
            <hr className="my-2 border-gray-800" />
            {user ? (
              <button onClick={handleLogout} className="px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg text-left transition-colors">
                Uitloggen
              </button>
            ) : (
              <>
                <MobileLink to="/login">Inloggen</MobileLink>
                <MobileLink to="/register">Registreer</MobileLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

function MobileLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
      {children}
    </Link>
  )
}

function DropdownLink({ to, onClose, icon, children }: { to: string; onClose: () => void; icon: 'user' | 'orders' | 'address' | 'admin'; children: React.ReactNode }) {
  const icons = {
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    orders: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    address: (<>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </>),
    admin: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  }
  return (
    <Link to={to} onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-gray-400">{icons[icon]}</svg>
      {children}
    </Link>
  )
}
