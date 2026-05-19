import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, CheckCircle, Home, BookOpen, Activity } from 'lucide-react';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ImpactMap from '../components/ImpactMap';

const Impact = () => {
  const stats = useMemo(() => [
    { label: 'Total Projects', value: 154, max: 200, color: 'bg-blue-500', icon: CheckCircle },
    { label: 'People Benefited', value: 52400, max: 60000, color: 'bg-green-500', icon: Users },
    { label: 'Villages Covered', value: 128, max: 150, color: 'bg-purple-500', icon: MapPin },
    { label: 'Years Active', value: 15, max: 20, color: 'bg-orange-500', icon: Heart },
  ], []);

  const categories = useMemo(() => [
    { name: 'Education Initiatives', count: 45, icon: BookOpen, desc: 'Schools built, scholarships, and supplies.' },
    { name: 'Healthcare Programs', count: 52, icon: Activity, desc: 'Medical camps, surgeries, and awareness.' },
    { name: 'Infrastructure', count: 30, icon: Home, desc: 'Water pumps, roads, and community halls.' },
    { name: 'Government Relief', count: 27, icon: CheckCircle, desc: 'PMAY housing, widow pensions, etc.' },
  ], []);

  return (
    <div className="w-full pb-24 pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Our Impact</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Numbers that tell a story of change, hope, and relentless effort. 
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
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
                    animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full ${stat.color}`}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Breakdown Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Projects by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary shrink-0">
                  <cat.icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{cat.name}</h3>
                  <p className="text-slate-600 text-sm mb-2">{cat.desc}</p>
                  <div className="text-lg font-extrabold text-secondary">{cat.count} Projects</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Impact Map Section */}
        <div className="mb-20">
          <ImpactMap />
        </div>

        {/* Narrative */}
        <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
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
