import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'

export default function Home() {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error)
      })
    }
  }, [])
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover opacity-40"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            poster="/images/hayes/crystal-hayes-front.jpeg"
          >
            <source src="/videos/Crystal_h264.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-8 md:mt-20">

          

          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
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

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-4xl sm:text-5xl md:text-7xl font-serif text-white leading-tight"
          >
            Unforgettable Moments in <br className="md:hidden" /><span className="text-crystal-gold italic">Extraordinary Spaces</span>
          </motion.h1>
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


      <div className="text-[8px] text-gray-200 text-center pb-4 opacity-10">v1.0.1</div>
    </div>
  )
}
