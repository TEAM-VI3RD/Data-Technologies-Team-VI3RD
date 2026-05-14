import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartContext } from '../context/CartContext'
import { getOrders, getAddresses } from '../api'
import DevNotice from '../components/DevNotice'
import { OrderStatusBadge } from './OrdersPage'
import type { Order } from '../types'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { cartCount } = useCartContext()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [addressCount, setAddressCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([getOrders(), getAddresses()])
      .then(([os, as]) => {
        setOrders(os ?? [])
        setAddressCount(as?.length ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/products')
  }

  const memberSince = new Date(user.created_at).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const memberSinceShort = new Date(user.created_at).toLocaleDateString('nl-NL', {
    month: 'short', year: 'numeric',
  })

  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0)
  const recentOrders = orders.slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* === HERO BANNER === */}
      <div className="relative overflow-hidden rounded-3xl mb-6 shadow-lg">
        {/* Achtergrond met gradient + decoratie */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur ring-4 ring-white/20 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white uppercase shrink-0">
            {user.email[0]}
          </div>

          <div className="flex-1 min-w-0 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Welkom terug</span>
              <span className="text-blue-200">·</span>
              <span className="text-xs text-blue-200">Lid sinds {memberSinceShort}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{user.email.split('@')[0]}</h1>
            <p className="text-sm text-blue-100 truncate">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {user.is_admin && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-500/30 text-purple-100 border border-purple-300/30 px-2.5 py-1 rounded-full backdrop-blur">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Administrator
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-500/30 text-green-100 border border-green-300/30 px-2.5 py-1 rounded-full backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                Actief account
              </span>
            </div>
          </div>

          {/* Quick logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors self-start"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Uitloggen
          </button>
        </div>
      </div>

      {/* === STAT-KAARTEN === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          to="/orders"
          label="Bestellingen"
          value={loading ? '...' : String(orders.length)}
          color="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          to="/orders"
          label="Totaal besteed"
          value={loading ? '...' : `€${totalSpent.toFixed(2)}`}
          color="green"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          to="/addresses"
          label="Adressen"
          value={loading ? '...' : String(addressCount)}
          color="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
        />
        <StatCard
          to="/cart"
          label="In winkelwagen"
          value={String(cartCount)}
          color="orange"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* === LINKERKOLOM === */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recente bestellingen */}
          <Card>
            <CardHeader title="Recente bestellingen" linkTo="/orders" linkLabel="Alles bekijken →" />
            {loading ? (
              <div className="px-6 pb-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 pb-6 text-center py-6">
                <p className="text-sm text-gray-400 mb-3">Nog geen bestellingen geplaatst</p>
                <Link to="/products" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Ga winkelen
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders/${o.id}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">Bestelling #{o.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {o.items?.length ?? 0} {(o.items?.length ?? 0) === 1 ? 'product' : 'producten'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-gray-800">€{o.total_amount.toFixed(2)}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Snelkoppelingen */}
          <Card>
            <CardHeader title="Snel naar" />
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {[
                { to: '/orders',    icon: '📦', label: 'Bestellingen' },
                { to: '/addresses', icon: '📍', label: 'Adressen' },
                { to: '/cart',      icon: '🛒', label: 'Winkelwagen' },
                { to: '/products',  icon: '🔍', label: 'Verder winkelen' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* === RECHTERKOLOM === */}
        <div className="space-y-5">
          {/* Accountgegevens */}
          <Card>
            <CardHeader title="Accountgegevens" />
            <div className="px-6 pb-6 space-y-4">
              <Field label="E-mailadres" value={user.email} />
              <Field label="Lid sinds" value={memberSince} />
              <Field label="Account type" value={user.is_admin ? 'Administrator' : 'Klant'} />
              <Field label="Status" value="Actief" valueClass="text-green-600 font-medium" />
            </div>
          </Card>

          {/* Instellingen */}
          <Card>
            <CardHeader title="Beveiliging" subtitle="Nog niet beschikbaar" />
            <div className="px-6 pb-6">
              <DevNotice feature="E-mailadres wijzigen" />
              <DevNotice feature="Wachtwoord wijzigen" />
              <DevNotice feature="Tweestapsverificatie" />
            </div>
          </Card>

          {/* Uitloggen (mobiel) */}
          <button
            onClick={handleLogout}
            className="sm:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-2xl px-6 py-4 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- helper componenten ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle, linkTo, linkLabel }: {
  title: string
  subtitle?: string
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-3">
      <div>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="text-xs font-medium text-blue-600 hover:text-blue-700">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function Field({ label, value, valueClass = 'text-gray-800' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm break-words ${valueClass}`}>{value}</p>
    </div>
  )
}

const COLORS = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  ring: 'ring-green-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100' },
}

function StatCard({ to, label, value, icon, color }: {
  to: string
  label: string
  value: string
  icon: React.ReactNode
  color: keyof typeof COLORS
}) {
  const c = COLORS[color]
  return (
    <Link
      to={to}
      className="group bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-3 ring-4 ${c.ring} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </Link>
  )
}
