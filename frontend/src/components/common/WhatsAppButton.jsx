import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = "918140255951"; 
  const message = encodeURIComponent("Hello! I'm interested in supporting Vanvasi Pragati Mandal. I'd like to know more about your projects.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] group flex items-center gap-3"
      aria-label="Contact us on WhatsApp"
    >
      {/* Tooltip */}
      <div className="bg-white text-slate-900 px-4 py-2 rounded-xl shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 border border-slate-100 whitespace-nowrap pointer-events-none">
        Chat with us!
      </div>
      
      {/* Button */}
      <div className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all duration-300 relative">
        <MessageCircle size={30} fill="white" />
        
        {/* Pinging Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40"></span>
      </div>
    </a>
  );
};

export default WhatsAppButton;
