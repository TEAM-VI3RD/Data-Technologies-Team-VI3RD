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

      {/* Actieve zoekterm — alleen tonen als hij gezet is */}
      {filters.q && (
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Zoekterm</label>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="text-sm text-blue-700 truncate flex-1">"{filters.q}"</span>
            <button
              onClick={() => set('q', '')}
              className="text-blue-400 hover:text-blue-600 shrink-0"
              title="Zoekterm wissen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
