import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

// Fix for default marker icons in Leaflet + React/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ImpactMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, projRes] = await Promise.all([
          supabase.from('impact_locations').select('*'),
          supabase.from('projects').select('*').not('lat', 'is', null).not('lng', 'is', null)
        ]);

        const markers = [];
        if (locRes.data) {
          locRes.data.forEach(l => {
            markers.push({
              id: `loc-${l.id}`,
              name: l.name,
              description: l.description || 'Impact Location',
              lat: l.lat,
              lng: l.lng,
              category: 'Community',
              image_url: null,
              projectUuid: null
            });
          });
        }
        if (projRes.data) {
          projRes.data.forEach(p => {
            const category = p.category ? p.category.split(',')[0].trim() : 'Project';
            markers.push({
              id: `proj-${p.uuid}`,
              name: p.title,
              description: p.description || 'Active Project',
              lat: p.lat,
              lng: p.lng,
              category: category,
              image_url: p.main_image_url || (p.images && p.images.length > 0 ? p.images[0].image_url : null),
              projectUuid: p.uuid
            });
          });
        }
        setLocations(markers);
      } catch (err) {
        console.error("Map data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute all unique categories dynamically
  const categories = useMemo(() => {
    if (locations.length === 0) return ['All'];
    const cats = new Set(locations.map(loc => loc.category));
    return ['All', ...Array.from(cats)];
  }, [locations]);

  // Filter locations dynamically in real-time
  const filteredLocations = useMemo(() => {
    if (activeCategory === 'All') return locations;
    return locations.filter(loc => loc.category === activeCategory);
  }, [locations, activeCategory]);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Our Footprint</h4>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Interactive Impact Map</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Explore the regions where we are actively working to bring sustainable change to tribal and rural communities.
            </p>
          </motion.div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm border ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-lg shadow-green-500/20 scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
          {loading ? (
            <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : null}

          <MapContainer
            center={[22.8333, 74.1500]}
            zoom={9}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLocations.map(loc => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup className="custom-leaflet-popup">
                  <div className="w-64 bg-white overflow-hidden rounded-2xl flex flex-col font-sans">
                    {/* Header Image if available */}
                    {loc.image_url ? (
                      <div className="h-32 w-full relative overflow-hidden bg-slate-100 shrink-0">
                        <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                          {loc.category}
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 pb-0 shrink-0">
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-primary text-[9px] font-black uppercase tracking-wider rounded-md">
                          {loc.category}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4 flex flex-col grow">
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1 leading-tight line-clamp-1">{loc.name}</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 grow mb-3">{loc.description}</p>
                      
                      {loc.projectUuid ? (
                        <Link 
                          to={`/projects/${loc.projectUuid}`} 
                          className="mt-auto inline-flex items-center gap-1 text-[11px] font-black text-secondary hover:text-blue-800 transition-colors uppercase tracking-wider border-t pt-2.5"
                        >
                          Explore Project &rarr;
                        </Link>
                      ) : (
                        <div className="mt-auto text-[10px] text-slate-400 font-bold uppercase tracking-wider border-t pt-2.5">
                          Impact Footprint
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay Info Card */}
          <div className="absolute bottom-8 left-8 z-[1000] hidden md:block">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 max-w-xs">
              <h4 className="font-bold text-slate-900 mb-2">Did you know?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                We currently have projects active in 120+ villages across the Dahod district.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Inline Extra Styles for Leaflet custom popup */}
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          overflow: hidden;
          border-radius: 1.5rem !important;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
          width: 256px !important;
        }
        .custom-leaflet-popup .leaflet-popup-close-button {
          padding: 8px !important;
          color: #64748b !important;
          top: 4px !important;
          right: 4px !important;
          font-size: 16px !important;
          z-index: 100;
        }
        .custom-leaflet-popup .leaflet-popup-close-button:hover {
          color: #1e293b !important;
        }
      `}</style>
    </section>
  );
};

export default ImpactMap;
