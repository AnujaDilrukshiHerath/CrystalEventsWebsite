import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MapPin, Users, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { getApiUrl } from '../utils/api'

export default function Venues() {
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/branches'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  const { data: halls, isLoading: loadingHalls } = useQuery({
    queryKey: ['halls'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/halls'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  if (loadingBranches || loadingHalls) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Venues...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-6">Our Premium Venues</h1>
        <p className="text-gray-600 text-lg font-light leading-relaxed">
          Discover our luxurious event spaces across London and Berkshire. Each location offers a unique blend of elegance and modern amenities to make your special day unforgettable.
        </p>
      </motion.div>

      <div className="space-y-24">
        {branches?.map((branch, index) => {
          const branchHalls = halls?.filter(h => h.branchId === branch.id) || []
          
          return (
            <motion.section 
              key={branch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Branch Header */}
              <div className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 lg:gap-16 items-center mb-12`}>
                <div className="w-full md:w-1/2">
                  <img 
                    src={branch.image} 
                    alt={branch.name} 
                    className="w-full aspect-[4/3] object-cover shadow-2xl rounded-sm"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <h2 className="text-4xl font-serif text-crystal-blue">{branch.name} Branch</h2>
                  <div className="flex items-center gap-2 text-crystal-gold font-medium">
                    <MapPin size={20} />
                    <span>{branch.location}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {branch.description}
                  </p>
                  {branch.mapLink && (
                    <a 
                      href={branch.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-crystal-gold text-crystal-gold hover:bg-crystal-gold hover:text-crystal-dark transition-all duration-300 uppercase tracking-wide text-sm font-medium"
                    >
                      <ExternalLink size={16} />
                      View on Map
                    </a>
                  )}
                </div>
              </div>

              {/* Halls Grid */}
              <div>
                <h3 className="text-2xl font-serif text-crystal-dark mb-8 border-b border-gray-200 pb-4">
                  Halls at {branch.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {branchHalls.map(hall => (
                    <div key={hall.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      <div className="relative overflow-hidden h-64">
                        <img 
                          src={hall.images[0]} 
                          alt={hall.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crystal-dark">
                          {hall.floor}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-serif text-crystal-blue mb-3">{hall.name}</h4>
                        <div className="flex flex-col gap-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} className="text-crystal-gold" />
                            <span>Capacity: {hall.minCapacity ? `${hall.minCapacity} - ` : ''}{hall.maxCapacity} guests</span>
                          </div>
                        </div>
                        <Link 
                          to={`/venues/${hall.id}`}
                          className="block w-full text-center py-3 bg-crystal-light text-crystal-dark font-medium uppercase tracking-wide text-sm hover:bg-crystal-gold hover:text-white transition-colors duration-300"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
