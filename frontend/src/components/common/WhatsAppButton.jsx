import React from 'react';

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
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="text-white"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.451 5.416 1.452 5.38-.002 9.757-4.378 9.76-9.76.002-2.607-1.012-5.059-2.859-6.908C17.067 2.088 14.619.824 12.01.824 6.626.824 2.247 5.203 2.244 10.589c-.001 1.921.501 3.797 1.454 5.398L2.733 21.05l5.247-1.378zm11.23-5.506c-.309-.156-1.832-.904-2.112-1.006-.28-.101-.484-.156-.688.156-.203.311-.789.996-.968 1.199-.178.203-.357.228-.666.072-1.353-.677-2.274-1.196-3.187-2.766-.24-.413.24-.383.687-1.278.077-.156.039-.293-.019-.41-.059-.117-.484-1.168-.663-1.6-.174-.421-.365-.363-.502-.37-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.603.284-.208.228-.794.776-.794 1.892 0 1.116.811 2.197.925 2.352.114.156 1.597 2.438 3.869 3.417.54.233.962.373 1.291.477.543.172 1.037.148 1.428.09.435-.065 1.832-.749 2.088-1.474.255-.724.255-1.344.178-1.474-.077-.13-.28-.208-.59-.364z" />
        </svg>
        
        {/* Pinging Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40"></span>
      </div>
    </a>
  );
};

export default WhatsAppButton;
