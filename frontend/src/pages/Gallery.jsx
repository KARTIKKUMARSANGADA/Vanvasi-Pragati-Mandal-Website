import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import ImageGallery from '../components/ImageGallery';
import { Skeleton } from '../components/common/Skeleton';
import { motion } from 'framer-motion';
import SEO from '../components/common/SEO';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  const fetchGallery = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setSkip(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentSkip = reset ? 0 : skip;
      const { data } = await api.get(`/gallery/?skip=${currentSkip}&limit=${LIMIT}`);
      
      if (Array.isArray(data)) {
        if (reset) {
          setImages(data);
        } else {
          setImages(prev => [...prev, ...data]);
        }
        
        if (data.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
          setSkip(currentSkip + LIMIT);
        }
      }
    } catch (err) {
      console.error('Failed to fetch gallery');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGallery(true);
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(images.map(img => img.category).filter(Boolean))];
    return cats;
  }, [images]);

  const filteredImages = useMemo(() => {
    if (activeCategory === 'All') return images;
    return images.filter(img => img.category === activeCategory);
  }, [images, activeCategory]);

  return (
    <div className="w-full pb-24 min-h-screen bg-white">
      <SEO 
        title="Gallery" 
        description="Explore the visual journey of Vanvasi Pragati Mandal. Photos from our projects in education, healthcare, and tribal empowerment." 
      />

      {/* Header */}
      <div className="bg-slate-50 pt-36 pb-20 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Impact in Focus</h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Every picture tells a story of transformation, resilience, and hope within the communities we serve.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        {!loading && categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-3xl" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
             <p className="text-slate-500 font-bold text-xl">No photos found in this category.</p>
           </div>
        ) : (
          <>
            <ImageGallery images={filteredImages} />
            
            {hasMore && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={() => fetchGallery(false)}
                  disabled={loadingMore}
                  className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-primary hover:text-primary disabled:opacity-50 transition-all flex items-center gap-2 group shadow-sm active:scale-95 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary mr-2"></div>
                      Loading Photos...
                    </>
                  ) : (
                    <>
                      Load More Photos
                      <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" /></svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(Gallery);
