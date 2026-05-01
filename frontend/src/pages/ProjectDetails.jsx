import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import api from '../api/axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error('Failed to fetch project', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Project Not Found</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">The project you are looking for does not exist or has been moved.</p>
        <Link to="/projects" className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-green-700 transition-all">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 pt-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img 
          src={project.images[0] ? `${project.images[0].image_url}` : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80'} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link 
                to="/projects" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
              >
                <ArrowLeft size={18} /> Back to Projects
              </Link>
              <div className="inline-block bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-lg shadow-green-500/30">
                {project.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                <span className="flex items-center gap-2"><Calendar size={20} className="text-primary" /> {project.date}</span>
                <span className="flex items-center gap-2"><MapPin size={20} className="text-primary" /> {project.location}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Info className="text-primary" /> Project Overview
              </h2>
              <p className="text-slate-700 text-lg leading-relaxed mb-8 font-medium">
                {project.description}
              </p>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {project.full_description}
                </p>
              </div>
            </motion.div>

            {/* Gallery Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Image Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.images.map((img, idx) => (
                  <div key={idx} className="h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <img src={`${img.image_url}`} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8 sticky top-24">
            {/* Impact Card */}
            {project.impact_points && project.impact_points.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-primary" /> Impact
                </h2>
                <ul className="space-y-3">
                  {project.impact_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                      <span className="text-slate-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Key Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-primary" /> Key Details
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 bg-green-100 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Location</span>
                    <span className="text-slate-700 font-medium">{project.location}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 bg-blue-100 text-secondary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Date</span>
                    <span className="text-slate-700 font-medium">{project.date}</span>
                  </div>
                </li>
              </ul>
              <div className="mt-10">
                <Link to="/contact" className="block w-full py-4 bg-secondary text-white text-center font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                  Support Similar Projects
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
