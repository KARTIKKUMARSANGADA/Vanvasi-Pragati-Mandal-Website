import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import communityimg from '../assets/communityphoto.png';

const Home = () => {
  const stats = [
    { label: 'Projects Completed', value: '150+', icon: CheckCircle },
    { label: 'People Benefited', value: '50,000+', icon: Users },
    { label: 'Villages Covered', value: '120+', icon: MapPin },
    { label: 'Years of Service', value: '15+', icon: Calendar },
  ];

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects/');
        // Sort by id descending to get the newest first, then take 3
        const latestProjects = data.sort((a, b) => b.id - a.id).slice(0, 3);
        setFeaturedProjects(latestProjects);
      } catch (err) {
        console.error('Failed to fetch featured projects', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden pt-[80px]">
        {/* Background Image - Absolute and at the bottom layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
            alt="Community Help" 
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Specific Dark Gradient Overlay: Darker on mobile for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50 md:via-black/50 md:to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-10">
          <div className="flex items-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-80px)]">
            {/* Left Column: Text Content */}
            <div className="text-left w-full max-w-[100%] sm:max-w-[90%] md:max-w-[700px]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 md:space-y-8"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] md:leading-[1.05]">
                  Empowering <br />
                  <span className="text-primary">Rural & Tribal</span> <br />
                  Communities
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-slate-200 leading-relaxed font-medium md:font-normal max-w-xl">
                  Dedicated to improving healthcare, education, and livelihoods in underserved communities through sustainable social impact initiatives.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 pt-2">
                  <Link to="/projects" className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-primary text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-xl shadow-green-500/40 flex items-center justify-center gap-2 text-base md:text-lg">
                    View Our Work <ArrowRight size={20} />
                  </Link>
                  <Link to="/contact" className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-transparent text-white font-bold rounded-full border-2 border-white hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center text-base md:text-lg">
                    Contact Us
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-y-3 gap-x-6 pt-4 md:pt-6">
                  <div className="flex items-center gap-2.5 text-white font-medium text-sm sm:text-base">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span>Government Projects Completed</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-white font-medium text-sm sm:text-base">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span>50,000+ People Benefited</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-white font-medium text-sm sm:text-base">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span>120+ Villages Covered</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean layout below hero */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <stat.icon size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">{stat.value}</h3>
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <img 
                src={communityimg}
                alt="Community work" 
                className="rounded-2xl shadow-2xl object-cover h-[400px] w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Who We Are</h4>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Building a Better Future Together</h2>
              <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                Vanvasi Pragati Mandal Pipaliya is a non-profit organization dedicated to the holistic development of rural and tribal areas. 
                Founded by Sangada Devisingbhai, our mission is to bridge the gap between resources and those who need them most.
              </p>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                We work closely with the government and local communities to execute transparent, high-impact projects.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-blue-800 transition-colors">
                Read More About Us <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Our Impact</h4>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Projects</h2>
            </div>
            <Link to="/projects" className="hidden md:inline-flex items-center gap-2 text-secondary font-semibold hover:text-blue-800">
              View All Projects <ArrowRight size={18} />
            </Link>
          </div>
          
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-white/50 animate-pulse rounded-2xl border border-slate-100"></div>
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
               <p className="text-slate-500 font-medium">No projects available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 group cursor-pointer flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                      {project.category}
                    </div>
                    <img 
                      src={project.images && project.images.length > 0 ? `${project.images[0].image_url}` : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80'} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">{project.description}</p>
                    <Link to={`/projects/${project.id}`} className="text-secondary font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto w-fit">
                      Read Case Study <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/projects" className="inline-flex items-center gap-2 text-secondary font-semibold">
              View All Projects <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary opacity-20 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6">Support Our Mission</h2>
          <p className="text-green-50 text-lg md:text-xl mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto">
            Together we can make a difference. Partner with us, volunteer, or contribute to bring positive change to the lives of thousands.
          </p>
          <Link to="/contact" className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-3.5 md:py-4 bg-white text-primary font-bold rounded-full hover:bg-green-50 transition-colors shadow-xl text-base md:text-lg">
            Join Us Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
