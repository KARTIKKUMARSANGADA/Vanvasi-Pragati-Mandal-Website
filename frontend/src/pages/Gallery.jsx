import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ImageGallery from '../components/ImageGallery';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const { data } = await api.get('/gallery/');
        if (isMounted) setImages(data);
      } catch (err) {
        console.error('Failed to fetch gallery');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGallery();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full pb-24 pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Photo Gallery</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Glimpses of our work, the smiles we bring, and the communities we serve.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ImageGallery images={images} />
        )}
      </div>
    </div>
  );
};

export default React.memo(Gallery);
