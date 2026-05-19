import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
  * ApiErrorCard Component
  * A beautifully designed premium error alert card with an optional Retry button.
  */
const ApiErrorCard = ({ message, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto my-12 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-[2rem] border border-red-100 shadow-xl text-center flex flex-col items-center gap-6"
    >
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner scale-110">
        <AlertCircle size={32} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900">Connection Issue</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {message || "We encountered an error trying to connect to our servers. Please check your internet connection or try again."}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-650 text-white font-bold text-sm rounded-full transition-all shadow-lg shadow-red-500/25 active:scale-95 cursor-pointer w-full sm:w-auto"
        >
          <RotateCcw size={16} />
          <span>Retry Connection</span>
        </button>
      )}
    </motion.div>
  );
};

export default ApiErrorCard;