import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welkom bij TechCycle</h1>
      <p className="text-gray-500 mb-8">
        Refurbished elektronica met garantie. Duurzaam, betaalbaar, betrouwbaar.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded font-medium"
        >
          Bekijk producten
        </Link>
        {!user && (
          <Link
            to="/register"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded font-medium"
          >
            Account aanmaken
          </Link>
        )}
        {user && (
          <Link
            to="/addresses"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded font-medium"
          >
            Mijn adressen
          </Link>
        )}
      </div>
    </div>
  )
}
