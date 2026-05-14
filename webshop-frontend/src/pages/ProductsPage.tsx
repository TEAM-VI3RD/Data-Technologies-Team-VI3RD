import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api'
import type { Product } from '../types'
import FilterPanel from '../components/FilterPanel'
import ProductImage from '../components/ProductImage'

const SORT_OPTIONS = [
  { value: '', label: 'Standaard' },
  { value: 'price_asc', label: 'Laagste prijs' },
  { value: 'price_desc', label: 'Hoogste prijs' },
  { value: 'new', label: 'Nieuwste' },
]

interface Filters {
  q: string
  sort: string
  minPrice: string
  maxPrice: string
  inStock: boolean
}

const DEFAULT_FILTERS: Filters = { q: '', sort: '', minPrice: '', maxPrice: '', inStock: false }

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const debouncedQ = useDebounce(filters.q, 350)

  const load = useCallback(async (f: Filters) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (f.q) params.q = f.q
      if (f.sort) params.sort = f.sort
      if (f.minPrice) params.min_price = f.minPrice
      if (f.maxPrice) params.max_price = f.maxPrice
      let results = (await getProducts(params)) ?? []
      if (f.inStock) results = results.filter((p) => p.stock > 0)
      setProducts(results)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Laden mislukt')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load({ ...filters, q: debouncedQ })
  }, [debouncedQ, filters.sort, filters.minPrice, filters.maxPrice, filters.inStock, load])

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  function reset() {
    setFilters(DEFAULT_FILTERS)
  }

  const hasActiveFilters =
    filters.q || filters.sort || filters.minPrice || filters.maxPrice || filters.inStock

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Producten</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-0.5">
              {products.length} {products.length === 1 ? 'resultaat' : 'resultaten'}
              {hasActiveFilters && ' — gefilterd'}
            </p>
          )}
        </div>
        {/* Mobiel: filterknop */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-500" />}
        </button>
      </div>

      {/* Mobiele filter-drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">Filters</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterPanel filters={filters} set={set} reset={reset} hasActiveFilters={!!hasActiveFilters} sortOptions={SORT_OPTIONS} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm"
            >
              {products.length} resultaten tonen
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <FilterPanel filters={filters} set={set} reset={reset} hasActiveFilters={!!hasActiveFilters} sortOptions={SORT_OPTIONS} />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="bg-gray-100 h-40" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded mb-3 w-full" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 text-sm">Geen producten gevonden.</p>
              {hasActiveFilters && (
                <button onClick={reset} className="mt-2 text-sm text-blue-500 hover:underline">
                  Filters wissen
                </button>
              )}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      to={`/products/${p.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      {/* Product afbeelding */}
      <div className="h-40 overflow-hidden bg-gray-50">
        <ProductImage name={p.name} size="card" className="group-hover:scale-105 transition-transform duration-300" />
      </div>

      <div className="p-4">
        {p.stock === 0 && (
          <span className="inline-block text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mb-1.5">
            Uitverkocht
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {p.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {p.description || '—'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">€{p.price.toFixed(2)}</span>
          {p.stock > 0 && (
            <span className="text-[10px] text-gray-400">{p.stock} stuks</span>
          )}
        </div>
      </div>
    </Link>
  )
}

