import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, ArrowRight } from 'lucide-react';
import SEO from '../components/common/SEO';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-20 relative overflow-hidden">
      <SEO 
        title="Page Not Found (404)" 
        description="The page you are looking for does not exist on Vanvasi Pragati Mandal trust's website." 
      />

      {/* Decorative blurred background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Animated Compass Icon */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="w-28 h-28 bg-white text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10 border border-slate-100"
        >
          <Compass size={56} className="animate-[spin_20s_linear_infinite]" />
        </motion.div>

        {/* 404 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 tracking-tighter mb-4"
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-extrabold text-slate-800 mb-4"
        >
          Page Lost in the Woods
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 mb-10 text-lg leading-relaxed max-w-md mx-auto"
        >
          The resource you are looking for has either been moved, deleted, or never existed in our database. Let's get you back on track.
        </motion.p>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-98 text-base group"
          >
            <Home size={18} />
            <span>Return to Homepage</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
