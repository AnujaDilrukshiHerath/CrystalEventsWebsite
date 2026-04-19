import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-7xl font-serif text-crystal-gold mb-4">404</h1>
      <h2 className="text-2xl font-serif text-crystal-blue mb-8">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/"
        className="px-8 py-3 bg-crystal-gold text-crystal-dark font-medium uppercase tracking-wider hover:bg-crystal-blue hover:text-white transition-colors duration-300"
      >
        Back to Home
      </Link>
    </div>
  )
}
