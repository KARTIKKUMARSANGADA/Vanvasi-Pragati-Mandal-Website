import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import logo from '../assets/LOGO.png';

const Footer = () => {
  return (
    <footer className="bg-[#04122E] text-slate-300 mt-auto w-full relative">
      {/* Wave Separator */}
      <div className="absolute bottom-full left-0 w-full overflow-hidden leading-[0] pointer-events-none translate-y-[2px]">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px] scale-y-[1.02] origin-bottom">
          <path
            fill="#04122E"
            d="M0,64L60,74.7C120,85,240,107,360,96C480,85,600,43,720,37.3C840,32,960,64,1080,74.7C1200,85,1320,75,1380,69.3L1440,64L1440,120L0,120Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 gap-x-8 lg:gap-x-12 mb-10">

          {/* ── Brand Column ── */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4">
            {/* Logo + Name — matches the first screenshot exactly */}
            <Link to="/" className="flex items-center gap-3 mb-4 hover:opacity-90 transition-opacity w-fit">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md p-1 overflow-hidden">
                <img src={logo} alt="Vanvasi Pragati Mandal Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[16px] font-bold text-white leading-tight tracking-tight">
                  Vanvasi Pragati Mandal Pipaliya
                </span>
                <span className="text-[12px] font-semibold text-primary tracking-wide">
                  Together for Tribal Empowerment
                </span>
              </div>
            </Link>

            <p className="text-[14px] leading-relaxed text-slate-400 mb-6 max-w-xs">
              Empowering tribal communities through education, healthcare, livelihood, and sustainable development initiatives.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300">
                <FaFacebook size={16} />
              </a>
              <a href="#" aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300">
                <FaInstagram size={16} />
              </a>
              <a href="#" aria-label="Youtube"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300">
                <FaYoutube size={16} />
              </a>
              <a href="#" aria-label="Twitter"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300">
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-5">Quick Links</h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/about" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  About Our Trust
                </Link>
              </li>
              <li>
                <Link to="/projects" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Ongoing Work
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/impact" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Our Real Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Focus Areas ── */}
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-5">Our Focus Areas</h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/projects?category=Education" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Tribal Education
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Health" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Healthcare Camps
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Government" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Govt Scheme Sync
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Infrastructure" className="flex items-center gap-2 text-[14px] text-slate-400 hover:text-primary font-medium transition-colors group">
                  <ChevronRight size={13} className="text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  Infrastructure Build
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Get In Touch ── */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-5">Get In Touch</h3>
            <ul className="space-y-3.5 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="text-[14px] text-slate-400 leading-relaxed">Pipaliya Village, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-primary shrink-0" />
                <span className="text-[14px] text-slate-400">+91 81402 55951</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="text-[14px] text-slate-400 break-all">official.vanvasipragatimandal@gmail.com</span>
              </li>
            </ul>

            <a
              href="https://wa.me/918140255951"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#25d366]/40 bg-[#25d366]/10 text-[#4ade80] hover:bg-[#25d366] hover:text-white hover:border-transparent transition-all duration-300 text-[13px] font-semibold hover:scale-105 active:scale-95"
            >
              <FaWhatsapp size={15} />
              Chat on WhatsApp
            </a>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-slate-800/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-slate-500">
            &copy; {new Date().getFullYear()} Vanvasi Pragati Mandal Pipaliya. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[13px] text-slate-500">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">|</span>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Use</Link>
            <span className="text-slate-700">|</span>
            <Link to="/admin-vpm-portal" className="text-primary hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
