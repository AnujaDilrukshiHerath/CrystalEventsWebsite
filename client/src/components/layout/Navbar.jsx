import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../common/Logo'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Our Venues', path: '/venues' },
  { name: 'Events We Host', path: '/events' },
  { name: 'Catering', path: '/catering' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact Us', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="fixed w-full z-50 bg-crystal-dark/90 backdrop-blur-md text-white shadow-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <Logo className="w-10 h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide uppercase transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'text-crystal-gold font-medium'
                    : 'text-gray-300 hover:text-crystal-gold'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="px-6 py-2 border border-crystal-gold text-crystal-gold hover:bg-crystal-gold hover:text-crystal-dark transition-all duration-300 text-sm tracking-wide uppercase"
            >
              Enquire Now
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-crystal-dark border-t border-gray-800"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-crystal-gold font-medium'
                      : 'text-gray-300 hover:text-crystal-gold'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
