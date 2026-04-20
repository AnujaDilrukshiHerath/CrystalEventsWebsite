import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import Logo from '../common/Logo'

export default function Footer() {
  return (
    <footer className="bg-crystal-dark text-white pt-16 pb-8 border-t border-crystal-gold/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="hover:opacity-90 transition-opacity mb-6 inline-block">
              <Logo className="w-12 h-12" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium event venues across London and Berkshire, specializing in unforgettable weddings, receptions, and cultural celebrations.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-crystal-gold hover:text-white transition-colors text-sm">
                Instagram
              </a>
              <a href="#" className="text-crystal-gold hover:text-white transition-colors text-sm">
                Facebook
              </a>
              <a href="#" className="text-crystal-gold hover:text-white transition-colors text-sm">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-xl text-crystal-gold mb-6">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/venues" className="text-gray-400 hover:text-crystal-gold transition-colors text-sm">Our Venues</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-crystal-gold transition-colors text-sm">Events We Host</Link></li>
              <li><Link to="/catering" className="text-gray-400 hover:text-crystal-gold transition-colors text-sm">Catering Services</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-crystal-gold transition-colors text-sm">Gallery</Link></li>
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h4 className="font-serif text-xl text-crystal-gold mb-6">Our Locations</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-crystal-gold shrink-0 mt-1" />
                <span>Hayes, London</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-crystal-gold shrink-0 mt-1" />
                <span>Slough, Berkshire</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-crystal-gold shrink-0 mt-1" />
                <span>Wembley, London</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-xl text-crystal-gold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-crystal-gold shrink-0" />
                <span>Wembley: 020 3576 5765</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-crystal-gold shrink-0" />
                <span>Hayes: 020 8848 4818</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-crystal-gold shrink-0" />
                <span>Slough: 01753 526 685</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} className="text-crystal-gold shrink-0" />
                <a href="mailto:info@crystaleventsandmanagement.co.uk" className="hover:text-crystal-gold transition-colors break-all">
                  info@crystaleventsandmanagement.co.uk
                </a>
              </li>
            </ul>
            <Link
              to="/contact"
              className="inline-block mt-6 px-6 py-2 bg-crystal-gold text-crystal-dark hover:bg-white transition-colors text-sm font-medium uppercase tracking-wide"
            >
              Book a Visit
            </Link>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Crystal Events. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
