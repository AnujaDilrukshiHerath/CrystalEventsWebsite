import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hayes/crystal-hayes-front.jpeg" 
            alt="Luxury Event Hall" 
            loading="eager"
            className="w-full h-full object-cover brightness-[0.4]"
          />

        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight"
          >
            Unforgettable Moments in <span className="text-crystal-gold italic">Extraordinary Spaces</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-10 font-light tracking-wide max-w-2xl mx-auto"
          >
            London and Berkshire's premier venues for luxury weddings, receptions, and cultural celebrations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/venues"
              className="px-8 py-4 bg-crystal-gold text-crystal-dark font-medium uppercase tracking-wider hover:bg-white transition-colors duration-300"
            >
              Explore Venues
            </Link>
            <Link 
              to="/contact"
              className="px-8 py-4 border border-crystal-gold text-crystal-gold font-medium uppercase tracking-wider hover:bg-crystal-gold hover:text-crystal-dark transition-all duration-300"
            >
              Book a Viewing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-crystal-light">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-serif text-crystal-blue mb-8">
            The Crystal Experience
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light">
            With three prestigious locations in Hayes, Slough, and Wembley, Crystal Events offers a versatile collection of luxury spaces. Whether you're planning an intimate saree ceremony, a grand Hindu wedding, or an elegant corporate gala, our venues provide the perfect canvas. Complemented by our authentic Sri Lankan and Indian catering services, we ensure every detail of your event is nothing short of perfection.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-crystal-dark relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-crystal-gold mb-6">
              Experience The Magic
            </h2>
            <p className="text-gray-300 font-light max-w-2xl mx-auto">
              Take a glimpse into the unforgettable moments we create at Crystal Events.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-video rounded-sm overflow-hidden shadow-2xl border border-crystal-gold/20"
          >
            <video 
              className="absolute top-0 left-0 w-full h-full object-cover"
              controls
              playsInline
              muted
              autoPlay
              loop
              poster="/images/hayes/crystal-hayes-front.jpeg"
            >
              <source src="https://res.cloudinary.com/dcekxtu0a/video/upload/v1776876055/z4imfrongibutcrhxbub.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

          </motion.div>
        </div>
      </section>
    </div>
  )
}
