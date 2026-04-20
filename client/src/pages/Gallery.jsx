import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getApiUrl } from '../utils/api'

export default function Gallery() {
  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/gallery'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Gallery...</div>
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
        <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-8">Our Gallery</h1>
        <p className="text-gray-600 text-lg font-light leading-relaxed">
          A collection of exquisite moments captured at our venues. Explore the elegance and grandeur of Crystal Events.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image, index) => (
          <motion.div 
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group overflow-hidden aspect-square rounded-sm shadow-lg bg-gray-200"
          >
            <img 
              src={image.url} 
              alt={image.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-crystal-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-crystal-gold text-xs uppercase tracking-widest mb-2">{image.category}</span>
              <h3 className="text-white text-lg font-serif">{image.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
