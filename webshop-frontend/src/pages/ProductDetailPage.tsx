import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct, addToCart } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCartContext } from '../context/CartContext'
import type { Product } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { refreshCart } = useCartContext()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (!id) return
    getProduct(Number(id))
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    if (!user) { navigate('/login'); return }
    setStatus('adding')
    try {
      await addToCart(product!.id, qty)
      refreshCart()
      setStatus('added')
      setStatusMsg(`${qty}× toegevoegd aan winkelwagen`)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: unknown) {
      setStatus('error')
      setStatusMsg(err instanceof Error ? err.message : 'Toevoegen mislukt')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-2xl h-72" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-10 bg-gray-100 rounded w-1/3 mt-6" />
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
    </div>
  )

  if (!product) return null

  const inStock = product.stock > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/products" className="hover:text-blue-600 transition-colors">Producten</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product afbeelding / placeholder */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-12 text-8xl min-h-64 select-none">
            {getEmoji(product.name)}
          </div>

          {/* Product info */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex-1">
              {!inStock && (
                <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full mb-3">
                  Uitverkocht
                </span>
              )}
              {inStock && (
                <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full mb-3">
                  Op voorraad
                </span>
              )}

              <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {product.description || 'Geen beschrijving beschikbaar.'}
              </p>

              <div className="text-3xl font-bold text-gray-900 mb-1">
                €{product.price.toFixed(2)}
              </div>
              {inStock && (
                <p className="text-xs text-gray-400 mb-6">{product.stock} stuks beschikbaar</p>
              )}
            </div>

            {inStock && (
              <div className="space-y-3">
                {/* Aantal kiezen */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Aantal</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-800 min-w-[2.5rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Toevoegen knop */}
                <button
                  onClick={handleAddToCart}
                  disabled={status === 'adding'}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    status === 'added'
                      ? 'bg-green-500 text-white'
                      : status === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60'
                  }`}
                >
                  {status === 'adding' && 'Bezig...'}
                  {status === 'added' && '✓ Toegevoegd'}
                  {status === 'error' && 'Mislukt'}
                  {status === 'idle' && (
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
                      </svg>
                      In winkelwagen
                    </span>
                  )}
                </button>

                {(status === 'added' || status === 'error') && (
                  <p className={`text-xs text-center ${status === 'added' ? 'text-green-600' : 'text-red-500'}`}>
                    {statusMsg}
                  </p>
                )}

                {!user && (
                  <p className="text-xs text-center text-gray-400">
                    Je wordt gevraagd in te loggen.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('macbook') || n.includes('laptop') || n.includes('thinkpad') || n.includes('zenbook') || n.includes('spectre') || n.includes('xps')) return '💻'
  if (n.includes('iphone') || n.includes('samsung galaxy s') || n.includes('pixel') || n.includes('oneplus') || n.includes('smartphone')) return '📱'
  if (n.includes('ipad') || n.includes('tab') || n.includes('tablet')) return '🖥️'
  if (n.includes('airpods') || n.includes('buds') || n.includes('headphone') || n.includes('wh-') || n.includes('qc') || n.includes('arctis')) return '🎧'
  if (n.includes('speaker') || n.includes('jbl') || n.includes('charge')) return '🔊'
  if (n.includes('switch') || n.includes('playstation') || n.includes('xbox') || n.includes('gaming')) return '🎮'
  if (n.includes('monitor') || n.includes('ultrasharp')) return '🖥️'
  if (n.includes('muis') || n.includes('mouse')) return '🖱️'
  if (n.includes('toetsenbord') || n.includes('keys')) return '⌨️'
  if (n.includes('oplader') || n.includes('adapter') || n.includes('power') || n.includes('kabel') || n.includes('hub')) return '🔌'
  return '📦'
}
