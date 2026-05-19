import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Save, X, Navigation } from 'lucide-react';
import { supabase } from '../../supabase';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import AdminLayout from '../../components/admin/AdminLayout';

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('impact_locations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (loc) => {
    setCurrentLocation(loc);
    setFormData({
      name: loc.name,
      description: loc.description,
      lat: loc.lat,
      lng: loc.lng
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this location from the map?')) {
      await supabase.from('impact_locations').delete().eq('id', id);
      fetchLocations();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    if (currentLocation) {
      await supabase.from('impact_locations').update(payload).eq('id', currentLocation.id);
    } else {
      await supabase.from('impact_locations').insert([payload]);
    }

    setIsModalOpen(false);
    fetchLocations();
  };

  return (
    <AdminLayout title="Map Locations">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-slate-500 font-medium">Manage interactive markers on the impact map</p>
          </div>
          <button 
            onClick={() => { setCurrentLocation(null); setFormData({ name: '', description: '', lat: '', lng: '' }); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
          >
            <Plus size={20} /> Add Location
          </button>
        </div>

        <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100 flex items-start gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-secondary">
            <Navigation size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900">Live Map Markers</h3>
            <p className="text-sm text-blue-700 mt-1">These markers will appear on the "Our Footprint" map section of the website.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <motion.div 
              layout
              key={loc.id}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <MapPin size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(loc)} className="p-2 text-slate-400 hover:text-primary transition-colors"><Save size={18} /></button>
                  <button onClick={() => handleDelete(loc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{loc.name}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{loc.description}</p>
              <div className="flex gap-4 text-xs font-mono text-slate-400 bg-slate-50 p-3 rounded-xl">
                <span>LAT: {loc.lat}</span>
                <span>LNG: {loc.lng}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">{currentLocation ? 'Edit Location' : 'New Location'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Location Name</label>
                    <input required className="w-full px-4 py-3 rounded-2xl border border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Health Camp Pipaliya" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                    <textarea className="w-full px-4 py-3 rounded-2xl border border-slate-200" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief impact summary..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Latitude</label>
                      <input type="number" step="any" required className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-sm" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} placeholder="22.833" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Longitude</label>
                      <input type="number" step="any" required className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-sm" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} placeholder="74.250" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all mt-4">
                    Save Location
                  </button>
                </form>

                {/* Interactive Leaflet Map Preview */}
                <div className="flex flex-col h-full min-h-[320px]">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location Preview (Click Map to Place Marker)</label>
                  <div className="grow rounded-[2rem] overflow-hidden border border-slate-200 relative shadow-inner h-[280px] md:h-full z-10 min-h-[260px]">
                    <MapContainer
                      center={[parseFloat(formData.lat) || 22.8333, parseFloat(formData.lng) || 74.1500]}
                      zoom={11}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController center={[parseFloat(formData.lat) || 22.8333, parseFloat(formData.lng) || 74.1500]} />
                      <MapClickHandler onMapClick={(lat, lng) => setFormData(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} />
                      {(formData.lat && formData.lng && !isNaN(parseFloat(formData.lat)) && !isNaN(parseFloat(formData.lng))) && (
                        <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLocations;
