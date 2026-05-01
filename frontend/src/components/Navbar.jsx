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
      setScrolled(window.scrollY > 20);
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

  // Check if we are on the home page to determine transparency behavior
  const isHomePage = location.pathname === '/';
  const navBackground = scrolled || !isHomePage ? 'bg-white shadow-md py-4' : 'bg-transparent py-6';
  const textColor = scrolled || !isHomePage ? 'text-slate-800' : 'text-white';
  const logoColor = scrolled || !isHomePage ? 'text-slate-800' : 'text-white';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={LOGO}
                alt="Community Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shrink-0"
              />
              <div className="ml-2 sm:ml-3">
                <h1 className={`text-[13px] sm:text-base md:text-xl font-bold leading-[1.2] transition-colors ${logoColor} max-w-[180px] sm:max-w-none`}>
                  Vanvasi Pragati<br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>Mandal Pipaliya
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? 'text-primary'
                    : `${textColor} hover:text-primary`
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="ml-4 px-6 py-2.5 rounded-full bg-secondary text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              Support Us
            </Link>
          </div>

          <div className="flex items-center md:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${textColor} hover:text-primary focus:outline-none p-2 -mr-2`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-2xl absolute w-full left-0 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="px-4 py-4 flex flex-col gap-1">
            {links.map((link, idx) => (
              <div key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isActive(link.path)
                      ? 'text-primary bg-green-50 border border-green-100/50'
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
                {idx !== links.length - 1 && <div className="h-px bg-slate-50 mx-4 my-1"></div>}
              </div>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-6 py-3.5 rounded-xl bg-secondary text-white font-bold hover:bg-blue-700 shadow-lg"
              >
                Support Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
