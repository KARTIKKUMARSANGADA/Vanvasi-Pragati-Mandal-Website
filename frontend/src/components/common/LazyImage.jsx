import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LazyImage = ({ src, alt, className, containerClassName = "", threshold = 0.1 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const target = containerRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [threshold]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-200 animate-pulse z-10"
          />
        )}
      </AnimatePresence>
      
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          onLoad={() => setIsLoaded(true)}
          className={`${className} ${isLoaded ? '' : 'invisible'}`}
        />
      )}
    </div>
  );
};

export default LazyImage;
