import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, CheckCircle, Home, BookOpen, Activity, AlertCircle, Layers, Star, Leaf, Shield, Zap } from 'lucide-react';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ImpactMap from '../components/ImpactMap';
import api from '../api/axios';
import ApiErrorCard from '../components/common/ApiErrorCard';

// Maps category name keywords → icon + description for auto-enrichment
const CATEGORY_META = [
  { keywords: ['education', 'school', 'literacy', 'learning', 'scholarship'], icon: BookOpen, desc: 'Schools built, scholarships, and learning supplies.' },
  { keywords: ['health', 'medical', 'healthcare', 'camp', 'medicine', 'hospital'], icon: Activity, desc: 'Medical camps, surgeries, and health awareness.' },
  { keywords: ['infrastructure', 'road', 'water', 'construction', 'building', 'facility'], icon: Home, desc: 'Water pumps, roads, and community infrastructure.' },
  { keywords: ['government', 'pmay', 'relief', 'scheme', 'pension', 'housing', 'welfare'], icon: Shield, desc: 'Govt. scheme facilitation, housing, and pensions.' },
  { keywords: ['livelihood', 'skill', 'employment', 'women', 'empowerment', 'farming', 'microfinance'], icon: Leaf, desc: 'Skill training, women empowerment, and livelihoods.' },
  { keywords: ['tribal', 'vanvasi', 'community', 'social', 'culture'], icon: Users, desc: 'Tribal community programs and cultural initiatives.' },
  { keywords: ['environment', 'tree', 'plant', 'green', 'eco', 'nature'], icon: Zap, desc: 'Environmental protection and plantation drives.' },
];

const DEFAULT_CATEGORY_META = { icon: Star, desc: 'Community development and welfare programs.' };

function enrichCategory(apiCategory) {
  const nameLower = (apiCategory.name || '').toLowerCase();
  const meta = CATEGORY_META.find(m => m.keywords.some(kw => nameLower.includes(kw))) || DEFAULT_CATEGORY_META;
  return {
    name: apiCategory.name,
    count: apiCategory.count,
    icon: meta.icon,
    desc: meta.desc,
  };
}

const Impact = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: 0, max: 200, color: 'bg-blue-500', icon: CheckCircle, key: 'total_projects' },
    { label: 'People Benefited', value: 0, max: 60000, color: 'bg-primary', icon: Users, key: 'people_benefited' },
    { label: 'Villages Covered', value: 0, max: 150, color: 'bg-purple-500', icon: MapPin, key: 'villages_covered' },
    { label: 'Years Active', value: 0, max: 20, color: 'bg-orange-500', icon: Heart, key: 'years_active' },
  ]);

  // categories is now always fully dynamic — no hardcoded counts
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/stats/public');
      const data = res.data;
      if (data) {
        // Update top-level stat cards from DB
        setStats(prev => prev.map(stat => ({
          ...stat,
          value: data[stat.key] ?? stat.value,
        })));

        // Build category list purely from DB — no hardcoded fallbacks mixed in
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories.map(enrichCategory));
        }
      }
    } catch (err) {
      console.error("Failed to fetch public stats");
      setError("Could not load latest impact metrics. Showing baseline figures instead.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="w-full pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 pt-28 pb-10 sm:pt-36 sm:pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Our Impact</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Numbers that tell a story of change, hope, and relentless effort. 
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20">
        {error && (
          <div className="mb-10 max-w-xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 text-sm font-semibold shadow-sm">
              <AlertCircle className="shrink-0 text-orange-600" size={20} />
              <div className="flex-1">{error}</div>
              <button 
                onClick={fetchStats}
                className="px-3 py-1 bg-orange-100 hover:bg-orange-200 active:scale-95 transition-all text-xs font-bold rounded-lg text-orange-950 shrink-0"
              >
                Retry Load
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
            ))}
          </div>
        ) : (
          /* Top Stats Cards */
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-1">
                  <AnimatedCounter value={stat.value.toLocaleString() + (stat.value > 100 ? '+' : '')} />
                </h3>
                <p className="text-slate-500 font-medium">{stat.label}</p>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full ${stat.color}`}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Breakdown Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Projects by Category</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl border border-slate-100" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-semibold">No project categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((cat, index) => (
                <motion.div 
                  key={cat.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary shrink-0">
                    <cat.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{cat.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{cat.desc}</p>
                    <div className="text-lg font-extrabold text-secondary">{cat.count} Project{cat.count !== 1 ? 's' : ''}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Map Section */}
        <div className="mb-20">
          <ImpactMap />
        </div>

        {/* Narrative */}
        <div className="bg-primary rounded-3xl p-6 sm:p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Beyond the Numbers</h2>
          <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto leading-relaxed relative z-10">
            While statistics show the scale of our work, the true impact is measured in the smiles of children going to school, 
            the relief of a mother getting medical help, and the pride of a family stepping into their new home. 
            We are building a legacy of self-reliance.
          </p>
        </div>

      </div>
    </div>
  );
};

export default React.memo(Impact);
