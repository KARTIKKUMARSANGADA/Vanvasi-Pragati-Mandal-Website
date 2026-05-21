import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LOGO from '../assets/LOGO.png';
import { useDonation } from '../context/DonationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openDonation } = useDonation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll on mobile when navbar menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Work', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Impact', path: '/impact' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const isTransparent = !scrolled && location.pathname === '/';

  return (
    <div className={`fixed left-0 w-full z-[1050] flex justify-center px-4 sm:px-6 transition-all duration-300 ${isTransparent ? 'top-6' : 'top-2'}`}>
      <nav className={`transition-all duration-300 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 w-full max-w-7xl flex justify-between items-center rounded-full ${isTransparent
          ? 'bg-transparent shadow-none border-transparent'
          : 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100'
        }`}>

        {/* Logo Section */}
        <Link 
          to="/" 
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white">
            <img
              src={LOGO}
              alt="Vanvasi Pragati Mandal Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden min-[300px]:flex flex-col">
            <h1 className={`text-[15px] sm:text-[16px] md:text-[18px] font-bold leading-tight transition-colors ${isTransparent ? 'text-white' : 'text-[#1e293b]'
              }`}>
              Vanvasi Pragati<br className="md:hidden" />
              <span className="hidden md:inline"> </span>Mandal Pipaliya
            </h1>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          <div className="flex items-center gap-6 xl:gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`relative text-[15px] xl:text-[16px] font-semibold transition-colors duration-300 py-1 ${isActive(link.path)
                    ? 'text-primary'
                    : (isTransparent ? 'text-white hover:text-white/80' : 'text-slate-600 hover:text-primary')
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={openDonation}
            className={`px-7 py-3 rounded-full transition-colors text-[15px] xl:text-[16px] font-semibold shadow-sm hover:shadow-md ${isTransparent
                ? 'bg-white text-primary hover:bg-gray-100'
                : 'bg-primary text-white hover:bg-primary-hover'
              }`}
          >
            Support Us
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`focus:outline-none p-2 transition-colors ${isTransparent ? 'text-white hover:text-white/80' : 'text-slate-600 hover:text-primary'
              }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-[calc(100%+10px)] left-4 right-4 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-w-7xl mx-auto"
          >
            <div className="p-4 flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    setIsOpen(false);
                    handleLinkClick(link.path);
                  }}
                  className={`block px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${isActive(link.path)
                      ? 'text-primary bg-green-50/50'
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 mt-2 border-t border-gray-100">
                <button
                  onClick={() => { setIsOpen(false); openDonation(); }}
                  className="w-full text-center px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors text-[15px] font-bold"
                >
                  Support Us
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
