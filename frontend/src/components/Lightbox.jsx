import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Lightbox Component
 * A premium, fullscreen image viewer with navigation and zoom-like feel.
 */
const Lightbox = ({ 
    images = [], 
    isOpen, 
    onClose, 
    currentIndex, 
    setCurrentIndex 
}) => {
    // Navigation handlers
    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length, setCurrentIndex]);

    const handlePrev = useCallback((e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length, setCurrentIndex]);

    // Keyboard support (ESC to close, Arrows to navigate)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleNext, handlePrev]);

    if (!isOpen || !images.length) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md select-none overflow-hidden"
                    onClick={onClose}
                >
                    {/* Close Button (X) */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-[1000] p-3.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 border border-white/10"
                        aria-label="Close Lightbox"
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation - Previous */}
                    {images.length > 1 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-6 z-[1000] p-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform -translate-y-1/2 top-1/2 border border-white/10 hover:scale-110 active:scale-95"
                            aria-label="Previous Image"
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {/* Navigation - Next */}
                    {images.length > 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-6 z-[1000] p-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform -translate-y-1/2 top-1/2 border border-white/10 hover:scale-110 active:scale-95"
                            aria-label="Next Image"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {/* Image Display */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[currentIndex]?.image_url || images[currentIndex]}
                            alt={`Gallery view ${currentIndex + 1}`}
                            className="w-full h-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
                        />
                        
                        {/* Index Indicator */}
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-white/90 font-semibold bg-white/10 px-6 py-2 rounded-full text-sm backdrop-blur-xl border border-white/20 shadow-xl">
                            {currentIndex + 1} <span className="text-white/40 mx-1">/</span> {images.length}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Lightbox;
