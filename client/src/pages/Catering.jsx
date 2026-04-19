import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Utensils } from 'lucide-react'
import { getApiUrl } from '../utils/api'

export default function Catering() {
  const { data: catering, isLoading } = useQuery({
    queryKey: ['catering'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/catering'))
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Menus...</div>
      </div>
    )
  }

  const cuisines = catering ? Object.values(catering) : []

  return (
    <div className="pt-32 pb-24 bg-crystal-light min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="flex justify-center mb-6">
            <Utensils size={40} className="text-crystal-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-6">Culinary Excellence</h1>
          <p className="text-gray-600 text-lg font-light leading-relaxed">
            Delight your guests with our exquisite catering options. We specialize in authentic Sri Lankan and premium Indian cuisines, offering customizable menus tailored to your event's specific needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {cuisines.map((cuisine, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 md:p-12 shadow-xl border-t-4 border-crystal-gold"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif text-crystal-blue mb-3">{cuisine.name}</h2>
                <p className="text-gray-500 italic">{cuisine.description}</p>
              </div>

              <div className="space-y-8">
                {Object.entries(cuisine.menu).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xl font-medium text-crystal-dark uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      {category}
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600 font-light">
                          <span className="w-1.5 h-1.5 bg-crystal-gold rounded-full shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-crystal-light text-center rounded-sm">
                <p className="text-sm text-gray-600 italic">
                  * This is a sample menu. Our executive chefs are happy to customize dishes based on dietary requirements and preferences.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
