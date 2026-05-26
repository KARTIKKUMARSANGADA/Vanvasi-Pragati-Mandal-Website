import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

// Custom green SVG map pin matching the site's primary brand colour
const greenPin = L.divIcon({
  className: '',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="#15803d" />
      <circle cx="14" cy="14" r="5" fill="white" />
    </svg>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

// Auto-close popup after 3 seconds when marker is clicked
const AutoCloseMarker = ({ loc }) => {
  const markerRef = useRef(null);
  const timerRef = useRef(null);

  const eventHandlers = {
    click() {
      const marker = markerRef.current;
      if (!marker) return;
      marker.openPopup();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        marker.closePopup();
      }, 3000);
    },
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <Marker ref={markerRef} position={[loc.lat, loc.lng]} icon={greenPin} eventHandlers={eventHandlers}>
      <Popup className="custom-leaflet-popup">
        <div className="px-3 py-2 font-sans">
          <h3 className="font-bold text-slate-900 text-sm leading-tight whitespace-nowrap">{loc.name}</h3>
        </div>
      </Popup>
    </Marker>
  );
};

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
            center={[22.93, 74.10]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            {/* CartoDB Positron — clean, minimal, modern tile style */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            {filteredLocations.map(loc => (
              <AutoCloseMarker key={loc.id} loc={loc} />
            ))}
          </MapContainer>

          {/* Compact Overlay Info Badge */}
          <div className="absolute bottom-4 left-4 z-[1000] hidden md:block">
            <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-100/60 max-w-[200px]">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-0.5">Did you know?</p>
              <p className="text-[11px] text-slate-500 leading-snug">
                120+ villages across Dahod district.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Leaflet popup styling — title only */}
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .custom-leaflet-popup .leaflet-popup-close-button {
          display: none !important;
        }
      `}</style>
    </section>
  );
};

export default ImpactMap;
