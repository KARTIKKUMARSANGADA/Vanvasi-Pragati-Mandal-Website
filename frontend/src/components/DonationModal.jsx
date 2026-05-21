import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Clock } from 'lucide-react';

const DonationModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-8 text-white text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-white fill-white" />
              </div>
              <h2 className="text-2xl font-black mb-1">Online Donation</h2>
              <p className="text-green-50 opacity-90 text-sm italic">Making a difference together.</p>
            </div>

            <div className="p-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
                <Clock size={14} />
                Coming Soon
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Digital Payments arriving shortly!</h3>
              
              <p className="text-slate-600 leading-relaxed">
                We are currently setting up our secure payment gateway to ensure your contributions are processed safely. 
              </p>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-4">In the meantime, you can reach out to us directly for support.</p>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
