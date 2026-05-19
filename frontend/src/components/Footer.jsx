import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 pt-10 pb-6 md:pt-14 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-x-8 lg:gap-8 mb-10">
          
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 hover:opacity-90 transition-opacity w-fit">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                <Heart size={18} fill="currentColor" />
              </div>
              <h2 className="text-[18px] md:text-[20px] font-bold text-white leading-tight">Vanvasi Pragati<br/>Mandal</h2>
            </Link>
            <p className="text-[13px] md:text-[14px] leading-[1.6] text-slate-400 max-w-md mb-6">
              Empowering rural and tribal communities through education, health, and sustainable development projects.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-[14px] md:text-[16px] font-bold mb-5 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">About Us</Link></li>
              <li><Link to="/projects" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Our Work</Link></li>
              <li><Link to="/gallery" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Gallery</Link></li>
              <li><Link to="/impact" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Our Impact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-[14px] md:text-[16px] font-bold mb-5 uppercase tracking-wider">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/projects?category=Education" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Education</Link></li>
              <li><Link to="/projects?category=Health" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Healthcare</Link></li>
              <li><Link to="/projects?category=Government" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Government Work</Link></li>
              <li><Link to="/projects?category=Infrastructure" className="text-[13px] md:text-[14px] hover:text-primary transition-colors block w-fit">Infrastructure</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-[14px] md:text-[16px] font-bold mb-5 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[13px] md:text-[14px] leading-[1.6]">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="text-slate-300">Pipaliya, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-3 text-[13px] md:text-[14px] leading-[1.6]">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="text-slate-300">+91 81402 55951</span>
              </li>
              <li className="flex items-center gap-3 text-[13px] md:text-[14px] leading-[1.6]">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="text-slate-300">official.vanvasipragatimandal@gmail.com</span>
              </li>
            </ul>
            
            <a 
              href="https://wa.me/918140255951" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full sm:w-fit px-5 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20 text-sm"
            >
              <FaWhatsapp size={20} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col items-center gap-2 relative">
          <p className="text-[12px] md:text-[13px] text-center text-slate-500 w-full px-4">
            &copy; {new Date().getFullYear()} Vanvasi Pragati Mandal Pipaliya. All rights reserved.
          </p>
          <Link to="/admin-vpm-portal" className="text-[12px] md:text-[13px] text-slate-500 hover:text-white transition-colors">
            Admin Login
          </Link>
          
          <button 
            onClick={scrollToTop}
            className="absolute right-0 top-6 hidden md:flex items-center justify-center w-10 h-10 bg-slate-800 text-white rounded-full hover:bg-primary transition-colors shadow-lg"
            title="Back to Top"
          >
            <ArrowUp size={20} />
          </button>
        </div>
        
        {/* Mobile Back to Top */}
        <div className="md:hidden flex justify-center mt-6">
           <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 text-[13px] rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm border border-slate-700"
          >
            <ArrowUp size={16} /> Back to Top
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
