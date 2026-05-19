import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CardSkeleton } from '../components/common/Skeleton';
import LazyImage from '../components/common/LazyImage';

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(6);

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

  // Memoized filtered projects (Category + Search)
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const cats = String(p.category || '').split(',').map(c => c.trim());
      const matchesCategory = activeCategory === 'All' || cats.includes(activeCategory);
      const matchesSearch = 
        String(p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.location || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, projects, searchQuery]);

  // Paginated projects
  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(0, displayLimit);
  }, [filteredProjects, displayLimit]);

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
        {/* Search and Category Filter */}
        <div className="space-y-8 mb-16">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto md:mx-0">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search projects by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-8 py-3 rounded-full font-bold text-sm transition-all shadow-sm whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-primary text-white shadow-primary/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedProjects.map((project, index) => {
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
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                        {String(project.category || 'General').split(',').map((cat, i) => (
                          <span key={i} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full shadow-sm">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                      <LazyImage 
                        src={mainImageUrl} 
                        alt={project.title} 
                        containerClassName="w-full h-full"
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

            {/* Load More Button */}
            {filteredProjects.length > displayLimit && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 6)}
                  className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-primary hover:text-primary transition-all flex items-center gap-2 group"
                >
                  Load More Projects
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" /></svg>
                </button>
              </div>
            )}
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
