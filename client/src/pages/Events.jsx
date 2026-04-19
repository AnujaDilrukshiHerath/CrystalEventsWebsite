import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../utils/api'

export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/events'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Events...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-6">Events We Host</h1>
        <p className="text-center text-gray-600 text-lg font-light leading-relaxed">
          From grand celebrations to intimate cultural ceremonies, Crystal Events provides the perfect backdrop for your most cherished moments. Our versatile spaces adapt to your unique vision.
        </p>
      </motion.div>

      <div className="space-y-24">
        {events?.map((event, index) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}
          >
            <div className="w-full md:w-1/2">
              <div className="relative overflow-hidden group rounded-sm shadow-2xl">
                {event.videoUrl ? (
                  <div className="w-full aspect-video md:aspect-[4/3]">
                    <iframe 
                      className="w-full h-full"
                      src={event.videoUrl} 
                      title={event.name} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <>
                    <img 
                      src={event.image} 
                      alt={event.name} 
                      loading="lazy"
                      className="w-full h-[350px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-1000"
                    />

                    <div className="absolute inset-0 border-[16px] border-white/20 mix-blend-overlay m-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6">
              <div className="text-crystal-gold uppercase tracking-widest text-sm font-semibold">
                Signature Celebration
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-crystal-blue">{event.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                {event.description}
              </p>
              
              <div className="pt-4">
                <Link 
                  to="/venues"
                  className="inline-block px-8 py-3 border border-crystal-gold text-crystal-gold hover:bg-crystal-gold hover:text-crystal-dark transition-all duration-300 uppercase tracking-wide text-sm font-medium"
                >
                  Find Suitable Venues
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
