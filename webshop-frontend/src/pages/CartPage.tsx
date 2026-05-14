import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCart, updateCartItem, removeFromCart, getAddresses, placeOrder } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCartContext } from '../context/CartContext'
import type { CartItem, Address } from '../types'
import ProductImage from '../components/ProductImage'

export default function CartPage() {
  const { user } = useAuth()
  const { refreshCart } = useCartContext()
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shippingId, setShippingId] = useState<number | null>(null)
  const [billingId, setBillingId] = useState<number | null>(null)
  const [orderMsg, setOrderMsg] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([getCart(), getAddresses()])
      .then(([cart, addrs]) => {
        setItems(cart ?? [])
        setAddresses(addrs ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, navigate])

  async function handleQtyChange(productId: number, qty: number) {
    if (qty < 1) return
    try {
      await updateCartItem(productId, qty)
      refreshCart()
      setItems((prev) =>
        prev.map((i) => i.product_id === productId ? { ...i, quantity: qty, subtotal: qty * i.unit_price } : i)
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bijwerken mislukt')
    }
  }

  async function handleRemove(productId: number) {
    try {
      await removeFromCart(productId)
      refreshCart()
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    }
  }

  async function handleOrder() {
    if (!shippingId || !billingId) { setOrderMsg('Selecteer een verzend- en factuuradres.'); return }
    setPlacing(true)
    setOrderMsg('')
    try {
      const order = await placeOrder(shippingId, billingId)
      refreshCart()
      navigate(`/orders/${order.id}`)
    } catch (err: unknown) {
      setOrderMsg(err instanceof Error ? err.message : 'Bestelling mislukt')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-100 rounded w-40 mb-6" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  const total = items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Winkelwagen</h1>
        {items.length > 0 && (
          <p className="text-sm text-gray-400 mt-0.5">{items.length} {items.length === 1 ? 'product' : 'producten'}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-full mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Je winkelwagen is leeg</p>
          <p className="text-sm text-gray-400 mb-5">Voeg producten toe om te beginnen.</p>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            Ga winkelen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Productlijst */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {items.map((item, idx) => (
                <div key={item.id} className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  {/* Productafbeelding */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <ProductImage name={item.product_name} size="card" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">€{item.unit_price.toFixed(2)} per stuk</p>
                  </div>

                  {/* Aantal */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={() => handleQtyChange(item.product_id, item.quantity - 1)}
                      className="px-2 sm:px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-800 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.product_id, item.quantity + 1)}
                      className="px-2 sm:px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-gray-800 w-16 sm:w-20 text-right shrink-0">
                    €{item.subtotal.toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Verwijder"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h10" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Samenvatting + bestellen */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Samenvatting</h2>

              <div className="space-y-2 mb-4">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate pr-2">{i.product_name} ×{i.quantity}</span>
                    <span className="shrink-0">€{i.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5 flex justify-between">
                <span className="font-semibold text-gray-800">Totaal</span>
                <span className="font-bold text-gray-900 text-lg">€{total.toFixed(2)}</span>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-3 mb-4 text-xs text-yellow-700">
                  Je hebt nog geen adressen.{' '}
                  <Link to="/addresses" className="underline font-medium">Voeg er een toe</Link> voor je bestelt.
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Verzendadres</label>
                    <select
                      value={shippingId ?? ''}
                      onChange={(e) => setShippingId(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— kies adres —</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name}, {a.street} {a.house_number}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Factuuradres</label>
                    <select
                      value={billingId ?? ''}
                      onChange={(e) => setBillingId(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— kies adres —</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name}, {a.street} {a.house_number}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {orderMsg && (
                <p className="text-xs text-red-500 mb-3">{orderMsg}</p>
              )}

              <button
                onClick={handleOrder}
                disabled={addresses.length === 0 || placing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                {placing ? 'Bezig...' : 'Bestelling plaatsen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
