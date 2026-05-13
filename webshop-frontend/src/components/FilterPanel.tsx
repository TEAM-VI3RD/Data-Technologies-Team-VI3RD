interface Filters {
  q: string
  sort: string
  minPrice: string
  maxPrice: string
  inStock: boolean
}

interface Props {
  filters: Filters
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  reset: () => void
  hasActiveFilters: boolean
  sortOptions: { value: string; label: string }[]
}

export default function FilterPanel({ filters, set, reset, hasActiveFilters, sortOptions }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">Filters</span>
        {hasActiveFilters && (
          <button onClick={reset} className="text-xs text-blue-500 hover:text-blue-700">
            Wis alles
          </button>
        )}
      </div>

      {/* Zoeken */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Zoeken</label>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Naam of beschrijving..."
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sortering */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sortering</label>
        <div className="flex flex-col gap-1.5">
          {sortOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => set('sort', o.value)}
              className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                filters.sort === o.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prijs */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Prijs (€)</label>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} step="any" placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm shrink-0">–</span>
          <input
            type="number" min={0} step="any" placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Op voorraad toggle */}
      <button
        onClick={() => set('inStock', !filters.inStock)}
        className="flex items-center gap-2.5 cursor-pointer w-full"
      >
        <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${filters.inStock ? 'bg-blue-500' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-gray-600">Alleen op voorraad</span>
      </button>
    </div>
  )
}
