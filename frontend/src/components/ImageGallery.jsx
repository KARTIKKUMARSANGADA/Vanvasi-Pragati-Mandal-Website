import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from './common/LazyImage';

const ImageGallery = ({ images = [] }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const openLightbox = (index) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);

    const showPrev = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const showNext = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedIndex === null) return;
            
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, images.length]);

    if (!images || images.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {images.map((image, index) => (
                    <motion.div
                        key={image.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group cursor-pointer overflow-hidden rounded-xl bg-slate-100 aspect-square focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        onClick={() => openLightbox(index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openLightbox(index);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View larger preview of ${image.category || 'gallery'} image ${index + 1}`}
                    >
                        <LazyImage 
                            src={image.image_url || image} 
                            alt={image.category ? `${image.category} Initiative - Gallery Image ${index + 1}` : `Vanvasi Community Initiative - Gallery Image ${index + 1}`} 
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                            <ZoomIn className="text-white mb-2" size={32} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
                        onClick={closeLightbox}
                    >
                        <button 
                            className="absolute top-6 right-6 text-white hover:text-primary transition-colors bg-white/10 p-3 rounded-full z-[2010]"
                            onClick={closeLightbox}
                        >
                            <X size={28} />
                        </button>

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-all bg-black/40 sm:bg-white/10 p-2 sm:p-4 rounded-full z-[2010] hover:scale-110 active:scale-95 pointer-events-auto"
                                    onClick={showPrev}
                                >
                                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>
                                <button 
                                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-all bg-black/40 sm:bg-white/10 p-2 sm:p-4 rounded-full z-[2010] hover:scale-110 active:scale-95 pointer-events-auto"
                                    onClick={showNext}
                                >
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>
                            </>
                        )}
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
                        >
                            <img 
                                src={images[selectedIndex]?.image_url || images[selectedIndex]} 
                                alt={images[selectedIndex]?.category ? `Enlarged View - ${images[selectedIndex].category} Initiative` : 'Enlarged Gallery View'} 
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                            />
                            
                            {/* Counter */}
                            <div className="mt-6 text-white/60 font-medium text-sm">
                                {selectedIndex + 1} / {images.length}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageGallery;
