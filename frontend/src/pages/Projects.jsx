import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/');
        if (isMounted) {
          const projectsData = Array.isArray(res.data) 
            ? res.data 
            : (res.data?.data || []);
          setProjects(projectsData);
        }
      } catch (err) {
        // Keep important error logging but minimal
        console.error("Failed to fetch projects");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  // Dynamically extract unique categories from projects - Memoized
  const categories = useMemo(() => {
    return ['All', ...new Set(projects.flatMap(p => 
      String(p.category || '').split(',').map(c => c.trim())
    ).filter(Boolean))];
  }, [projects]);

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    return activeCategory === 'All' 
      ? projects 
      : projects.filter(p => {
          const cats = String(p.category || '').split(',').map(c => c.trim());
          return cats.includes(activeCategory);
        });
  }, [activeCategory, projects]);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
  }, []);

  return (
    <div className="w-full pb-24 pt-20">
      {/* Page Header */}
      <div className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Our Projects</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the impact of our initiatives across rural and tribal communities. From building infrastructure to empowering local youth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-primary/20' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const projectId = project.uuid || project.id;
              const mainImageUrl = project.main_image_url || (project.images && project.images.length > 0 ? project.images[0].image_url : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80');

              return (
                <motion.div
                  key={projectId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                      {String(project.category || 'General').split(',').map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full shadow-sm">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                    <img 
                      src={mainImageUrl} 
                      alt={project.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                    {String(project.title || 'Untitled Project')}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {String(project.date || 'N/A')}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {String(project.location || 'N/A')}</span>
                  </div>
                  
                  <p className="text-slate-600 mb-6 text-sm flex-grow line-clamp-3">
                    {String(project.description || '')}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Link 
                      to={projectId ? `/projects/${projectId}` : "#"} 
                      className="inline-flex items-center justify-between w-full text-secondary font-semibold hover:text-blue-800 transition-colors group/link"
                    >
                      <span>View Project Details</span>
                      <ArrowRight size={18} className="transform group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-xl text-slate-500">No projects found matching your criteria.</p>
            <button 
              onClick={() => {setActiveCategory('All');}}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Projects);
