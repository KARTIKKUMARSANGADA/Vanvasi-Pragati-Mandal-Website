import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, CheckCircle2, Info, ZoomIn, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import Lightbox from '../components/Lightbox';
import { Skeleton, ProjectDetailSkeleton } from '../components/common/Skeleton';
import LazyImage from '../components/common/LazyImage';

const ProjectDetails = () => {
  const { uuid } = useParams();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchProjectAndRelated = async () => {
      if (!uuid || uuid === 'undefined') {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/projects/${uuid}`);
        if (isMounted) {
          setProject(res.data);
          // Fetch related projects by category
          const category = res.data.category || 'General';
          const relatedRes = await api.get(`/projects/?category=${category}&limit=4`);
          const filtered = Array.isArray(relatedRes.data)
            ? relatedRes.data.filter(p => (p.uuid || p.id) !== uuid)
            : [];
          setRelatedProjects(filtered.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch project details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjectAndRelated();
    return () => { isMounted = false; };
  }, [uuid]);

  if (loading) {
    return (
      <div className="w-full bg-slate-50 min-h-screen pb-24 pt-28">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Project Not Found</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">The project you are looking for does not exist or has been moved.</p>
        <Link to="/projects" className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-green-700 transition-all">
          Back to Projects
        </Link>
      </div>
    );
  }

  const mainImageUrl = project.main_image_url || project.images?.find(img => img.is_main)?.image_url || project.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80';

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      
      {/* Restored Original Hero Section - Fixed with Flexbox to prevent overlap */}
      <div className="relative min-h-[85vh] w-full flex flex-col justify-end pb-24 overflow-hidden pt-28">
        {/* Immersive Hero Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={mainImageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Improved Back Button Visibility: Top-Left */}
        <Link
          to="/projects"
          className="absolute top-8 left-8 z-30 hidden md:inline-flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-black/60 transition-all font-semibold border border-white/30 group shadow-xl"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Projects</span>
        </Link>

        {/* Content Section: Restored to original position but using relative flex layout */}
        <div className="relative z-20 w-full px-6 md:px-12">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Category Badge */}
              <div className="flex flex-wrap gap-2">
                {String(project.category || 'General').split(',').map((cat, i) => (
                  <span
                    key={i}
                    className="bg-primary/90 text-white text-[10px] md:text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl backdrop-blur-sm"
                  >
                    {cat.trim()}
                  </span>
                ))}
              </div>

              {/* Impactful Title with clean hierarchy */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                {String(project.title || 'Untitled Project')}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Restored Original Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-30">
        
        {/* Restored Breadcrumb Navigation Bar */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-100/50 shadow-lg flex flex-wrap items-center gap-2 text-sm text-slate-500 font-bold mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <Link to="/projects" className="hover:text-primary transition-colors">Our Work</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 line-clamp-1 max-w-[200px] md:max-w-md font-extrabold">{String(project.title || 'Untitled')}</span>
        </div>

        {/* Restored Grid Layout */}
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
                {String(project.description || '')}
              </p>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {String(project.full_description || '')}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Project Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.images?.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img
                      src={image.image_url || image}
                      alt={`Project gallery ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn className="text-white" size={24} />
                      </div>
                    </div>
                  </motion.div>
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
                      <span className="text-slate-700 font-medium">{String(point)}</span>
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
                    <span className="text-slate-700 font-medium">{String(project.location || 'N/A')}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 bg-blue-100 text-secondary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase font-bold">Date</span>
                    <span className="text-slate-700 font-medium">{String(project.date || 'N/A')}</span>
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

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <div className="mt-24 border-t border-slate-200 pt-16 pb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center md:text-left">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((p, idx) => {
                const pid = p.uuid || p.id;
                const img = p.main_image_url || p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80';
                return (
                  <Link
                    key={pid}
                    to={`/projects/${pid}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group flex flex-col h-full hover:shadow-2xl transition-all"
                  >
                    <div className="relative h-48 overflow-hidden shrink-0">
                      <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 text-lg">{p.title}</h3>
                      <div className="mt-auto pt-4 text-primary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore Case Study <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Image Lightbox */}
      <Lightbox
        images={project.images || []}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        currentIndex={selectedImageIndex}
        setCurrentIndex={setSelectedImageIndex}
      />
    </div>
  );
};

export default React.memo(ProjectDetails);
