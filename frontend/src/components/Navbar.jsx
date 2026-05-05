import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import LOGO from '../assets/LOGO.png'; 


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Work', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Impact', path: '/impact' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Logic for transparent vs solid states
  const isTransparent = !scrolled && location.pathname === '/';
  
  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
        isTransparent 
          ? 'bg-transparent py-5' 
          : 'bg-white py-3 shadow-lg border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src={LOGO}
                  alt="Community Logo"
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover transition-all duration-300 ${
                    isTransparent ? 'shadow-md ring-2 ring-white/20' : 'shadow-sm ring-1 ring-slate-100'
                  } group-hover:scale-105`}
                />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-base sm:text-lg md:text-xl font-extrabold leading-tight transition-colors duration-300 ${
                  isTransparent ? 'text-white' : 'text-slate-900'
                }`}>
                  Vanvasi Pragati<br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>Mandal Pipaliya
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-2 text-sm font-semibold transition-all duration-300 ease-in-out hover:text-primary ${
                    isActive(link.path)
                      ? 'text-primary'
                      : isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                  {/* Active Link Underline */}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                    isActive(link.path) ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </Link>
              ))}
            </div>
            
            <Link
              to="/contact"
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
                isTransparent 
                  ? 'bg-white text-primary hover:bg-slate-50' 
                  : 'bg-primary text-white hover:bg-green-700'
              }`}
            >
              Support Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none p-2 transition-colors ${
                isTransparent ? 'text-white' : 'text-slate-600 hover:text-primary'
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute w-full bg-white border-t border-slate-100 shadow-2xl transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="px-4 py-6 flex flex-col space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive(link.path)
                  ? 'text-primary bg-green-50'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-6 py-4 rounded-xl bg-primary text-white font-bold hover:bg-green-700 shadow-md"
            >
              Support Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
