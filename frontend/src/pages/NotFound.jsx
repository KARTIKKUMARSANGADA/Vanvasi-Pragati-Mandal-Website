import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
      {/* Dynamic Glowing Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        {/* Animated Compass Icon Card */}
        <motion.div
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
          className="w-24 h-24 bg-gradient-to-tr from-primary to-green-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20"
        >
          <Compass className="text-white w-12 h-12 animate-spin-slow" />
        </motion.div>

        {/* 404 Heading */}
        <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent tracking-tight leading-none mb-4">
          404
        </h1>

        {/* Dynamic Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
          Page Not Found
        </h2>

        {/* Description Text */}
        <p className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed max-w-md mx-auto">
          We couldn't find the page you are looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-extrabold rounded-2xl shadow-lg shadow-green-500/20 hover:bg-primary-hover transition-all text-sm w-full sm:w-auto"
            >
              <Home size={18} />
              Return Home
            </motion.button>
          </Link>
          
          <Link to="/projects">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-extrabold rounded-2xl border border-white/10 transition-all text-sm w-full sm:w-auto"
            >
              <MapPin size={18} />
              Explore Projects
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Styled Inline Extra Styles for spin slow */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default React.memo(NotFound);
