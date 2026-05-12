import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('impact_locations')
          .select('*');

        if (data) {
          setLocations(data);
        }
      } catch (err) {
        console.error("Map data fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Our Footprint</h4>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Interactive Impact Map</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Explore the regions where we are actively working to bring sustainable change to tribal and rural communities.
            </p>
          </motion.div>
        </div>

        <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
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
            {locations.map(loc => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h3 className="font-bold text-slate-900 mb-1">{loc.name}</h3>
                    <p className="text-sm text-slate-600 leading-tight">{loc.description}</p>
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
    </section>
  );
};

export default ImpactMap;
