import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import logo from '../assets/LOGO.png';

const Footer = () => {
  return (
    <footer className="bg-[#04122E] text-slate-300 mt-auto w-full relative">
      {/* Subtle Single Wave Separator */}
      <div className="absolute bottom-full left-0 w-full overflow-hidden leading-[0] pointer-events-none -mb-[1px]">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px]">
          <path 
            fill="#04122E" 
            d="M0,64L60,74.7C120,85,240,107,360,96C480,85,600,43,720,37.3C840,32,960,64,1080,74.7C1200,85,1320,75,1380,69.3L1440,64L1440,120L0,120Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 lg:gap-12 mb-10">
          
          {/* Brand Section */}
          <div className="col-span-1 lg:pr-4">
            <Link to="/" className="flex items-center gap-3 mb-4 hover:opacity-90 transition-opacity w-fit">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm p-1 overflow-hidden">
                <img src={logo} alt="Vanvasi Pragati Mandal Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-[18px] font-bold text-white leading-tight">Vanvasi Pragati<br/>Mandal Pipaliya</h2>
            </Link>
            <p className="text-[#22C55E] text-[14px] font-semibold mb-3">Together for Tribal Empowerment</p>
            <p className="text-[14px] leading-relaxed text-slate-400 mb-6">
              Empowering tribal communities through education, healthcare, livelihood, and sustainable development initiatives.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E] hover:scale-110 transition-all duration-300">
                <FaFacebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E] hover:scale-110 transition-all duration-300">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E] hover:scale-110 transition-all duration-300">
                <FaYoutube size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E] hover:scale-110 transition-all duration-300">
                <FaTwitter size={14} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-[15px] font-semibold mb-5 tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  About Our Trust
                </Link>
              </li>
              <li>
                <Link to="/projects" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Ongoing Work
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/impact" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Our Real Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Focus Areas */}
          <div>
            <h3 className="text-white text-[15px] font-semibold mb-5 tracking-wide">Our Focus Areas</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/projects?category=Education" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Tribal Education
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Health" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Healthcare Camps
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Government" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Govt Scheme Sync
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Infrastructure" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-[#22C55E] transition-colors w-fit group">
                  <ChevronRight size={14} className="text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                  Infrastructure Build
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-[15px] font-semibold mb-5 tracking-wide">Get In Touch</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-[14px] leading-relaxed">
                <MapPin size={16} className="text-[#22C55E] shrink-0 mt-1" />
                <span className="text-slate-400">Pipaliya Village, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-3 text-[14px]">
                <Phone size={16} className="text-[#22C55E] shrink-0" />
                <span className="text-slate-400">+91 81402 55951</span>
              </li>
              <li className="flex items-center gap-3 text-[14px]">
                <Mail size={16} className="text-[#22C55E] shrink-0" />
                <span className="text-slate-400">official.vanvasipragatimandal@gmail.com</span>
              </li>
            </ul>
            
            <a 
              href="https://wa.me/918140255951" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white rounded-md transition-all duration-300 text-[13px] font-medium hover:scale-105"
            >
              <FaWhatsapp size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-slate-500">
            &copy; {new Date().getFullYear()} Vanvasi Pragati Mandal Pipaliya. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[13px] text-slate-500">
            <Link to="#" className="hover:text-[#22C55E] transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">|</span>
            <Link to="#" className="hover:text-[#22C55E] transition-colors">Terms of Use</Link>
            <span className="text-slate-700">|</span>
            <Link to="/admin-vpm-portal" className="text-[#22C55E] hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
