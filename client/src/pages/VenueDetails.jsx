import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Users, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function VenueDetails() {
  const { id } = useParams()

  const { data: hall, isLoading: loadingHall } = useQuery({
    queryKey: ['hall', id],
    queryFn: async () => {
      const res = await fetch(`/api/halls/${id}`)
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  // We fetch branches to get the branch name and location
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await fetch('/api/branches')
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  if (loadingHall || loadingBranches) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Details...</div>
      </div>
    )
  }

  if (!hall) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-serif text-crystal-blue mb-4">Venue Not Found</h2>
        <Link to="/venues" className="text-crystal-gold hover:underline">Return to Venues</Link>
      </div>
    )
  }

  const branch = branches?.find(b => b.id === hall.branchId)

  return (
    <div className="pt-24 pb-24 container mx-auto px-4 min-h-screen">
      <Link to="/venues" className="inline-flex items-center gap-2 text-gray-500 hover:text-crystal-gold transition-colors mb-8">
        <ArrowLeft size={16} />
        Back to Venues
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative h-[400px] md:h-[600px] rounded-sm overflow-hidden shadow-2xl">
            <img 
              src={hall.images[0]} 
              alt={hall.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Future: Image gallery thumbnails can go here */}
        </motion.div>

        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div>
            <div className="text-crystal-gold uppercase tracking-widest text-sm font-semibold mb-2">
              {branch?.name} Branch
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-4">{hall.name}</h1>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              {hall.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-8 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-crystal-light rounded-full text-crystal-gold">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-medium text-crystal-dark">Capacity</h4>
                <p className="text-sm text-gray-500">
                  {hall.minCapacity ? `${hall.minCapacity} to ` : 'Up to '}{hall.maxCapacity} Guests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-crystal-light rounded-full text-crystal-gold">
                <Layers size={24} />
              </div>
              <div>
                <h4 className="font-medium text-crystal-dark">Location</h4>
                <p className="text-sm text-gray-500">{hall.floor} Floor</p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:col-span-2">
              <div className="p-3 bg-crystal-light rounded-full text-crystal-gold">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-medium text-crystal-dark">Address</h4>
                <p className="text-sm text-gray-500">{branch?.location}</p>
                {branch?.mapLink && (
                  <a href={branch.mapLink} target="_blank" rel="noopener noreferrer" className="text-crystal-gold text-sm hover:underline mt-1 inline-block">
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-crystal-dark">Ideal For</h3>
            <ul className="grid grid-cols-2 gap-3">
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={18} className="text-crystal-gold" /> Hindu Weddings
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={18} className="text-crystal-gold" /> Receptions
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={18} className="text-crystal-gold" /> Saree Ceremonies
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={18} className="text-crystal-gold" /> Corporate Events
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <Link 
              to={`/contact?hall=${hall.id}&branch=${branch?.id}`}
              className="inline-block w-full sm:w-auto text-center px-10 py-4 bg-crystal-gold text-crystal-dark font-medium uppercase tracking-widest hover:bg-crystal-blue hover:text-white transition-colors duration-300"
            >
              Enquire About This Hall
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
