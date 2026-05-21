import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Users, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AnimatedCounter from '../components/common/AnimatedCounter';
import communityimg from '../assets/communityphoto.png';
import FAQ from '../components/FAQ';
import { useDonation } from '../context/DonationContext';
import SEO from '../components/common/SEO';

const Home = () => {
  const { openDonation } = useDonation();
  
  // Unified synced slideshow data model
  const heroSlides = useMemo(() => [
    {
      bg: "/hero-bg.png",
      badge: "Serving Since 2010",
      titleLine1: "Empowering",
      titleLine2: "Rural & Tribal",
      titleLine2Color: "text-primary italic",
      titleLine3: "Communities",
      description: "Dedicated to improving healthcare, education, and livelihoods in underserved communities through sustainable initiatives."
    },
    {
      bg: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600",
      badge: "Education First",
      titleLine1: "Enabling",
      titleLine2: "Education & Literacy",
      titleLine2Color: "text-blue-400 italic",
      titleLine3: "Initiatives",
      description: "Providing modern school resources, village learning camps, and quality coaching to children across tribal belts."
    },
    {
      bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600",
      badge: "Healthcare Camps",
      titleLine1: "Providing",
      titleLine2: "Healthcare & Medicine",
      titleLine2Color: "text-rose-400 italic",
      titleLine3: "Access",
      description: "Bringing diagnosis camps, basic medicine supplies, and emergency clinical transport closer to remote hamlets."
    },
    {
      bg: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1600",
      badge: "Livelihood Support",
      titleLine1: "Creating",
      titleLine2: "Sustainable Livelihoods",
      titleLine2Color: "text-amber-400 italic",
      titleLine3: "Opportunities",
      description: "Empowering local women and youth through skill training, organic farming projects, and micro-entrepreneurship."
    }
  ], []);

  const [currentBgIdx, setCurrentBgIdx] = useState(0);

  // Cinematic synced slideshow rotation timer (6 seconds)
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIdx(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(bgInterval);
  }, [heroSlides.length]);
  const [stats, setStats] = useState([
    { label: 'Projects Completed', value: '150+', icon: CheckCircle, key: 'total_projects' },
    { label: 'People Benefited', value: '50,000+', icon: Users, key: 'people_benefited' },
    { label: 'Villages Covered', value: '120+', icon: MapPin, key: 'villages_covered' },
    { label: 'Years of Service', value: '15+', icon: Calendar, key: 'years_active' },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchPublicStats = async () => {
      try {
        const res = await api.get('/stats/public');
        const data = res.data;
        if (data && isMounted) {
          setStats(prev => prev.map(stat => {
            const val = data[stat.key];
            return {
              ...stat,
              value: val ? `${val.toLocaleString()}+` : stat.value
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch public stats");
      }
    };
    fetchPublicStats();
    return () => { isMounted = false; };
  }, []);

  const DEFAULT_TESTIMONIALS = useMemo(() => [
    {
      quote: "I never thought I could finish school after my father passed away. Vanvasi Pragati Mandal supported my education, and today I am the first college graduate in my village.",
      name: "Ramesh Sangada",
      role: "Student & Scholarship Recipient",
      image: null
    },
    {
      quote: "The medical camp saved my daughter's life. We couldn't afford the surgery, but the trust organized everything and covered all costs. We are forever grateful.",
      name: "Meena Ben",
      role: "Beneficiary Mother",
      image: null
    }
  ], []);

  const [testimonials, setTestimonials] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setSubscribeStatus('loading');
    try {
      const res = await api.post('/subscribers/', { email: newsletterEmail });
      setSubscribeStatus('success');
      setSubscribeMessage(res.data.message || 'Subscribed successfully!');
      setNewsletterEmail('');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    } catch (err) {
      setSubscribeStatus('error');
      setSubscribeMessage(err.response?.data?.detail || 'Failed to subscribe. Please try again.');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects/?limit=10');
        if (isMounted) {
          const projectsData = Array.isArray(data) ? data : (data?.data || []);
          setFeaturedProjects(projectsData);
        }
      } catch (err) {
        console.error("Failed to fetch featured projects");
      } finally {
        if (isMounted) setLoadingProjects(false);
      }
    };
    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchTestimonials = async () => {
      try {
        const { data } = await api.get('/content/testimonials');
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setTestimonials(data);
          } else {
            setTestimonials(DEFAULT_TESTIMONIALS);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic testimonials, using fallbacks:", err);
        if (isMounted) setTestimonials(DEFAULT_TESTIMONIALS);
      }
    };
    fetchTestimonials();
    return () => { isMounted = false; };
  }, [DEFAULT_TESTIMONIALS]);

  const shuffleProjects = () => {
    setFeaturedProjects(prev => [...prev].sort(() => Math.random() - 0.5));
    setStartIndex(0);
  };

  const visibleProjects = useMemo(() => {
    if (featuredProjects.length === 0) return [];
    const result = [];
    for (let i = 0; i < Math.min(3, featuredProjects.length); i++) {
      const idx = (startIndex + i) % featuredProjects.length;
      result.push(featuredProjects[idx]);
    }
    return result;
  }, [featuredProjects, startIndex]);

  return (
    <div className="w-full">
      <SEO 
        title="Home" 
        description="Empowering rural and tribal communities in Gujarat through education, healthcare, and sustainable development projects." 
      />
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] md:h-[90vh] lg:h-screen flex items-center overflow-hidden pt-12 md:pt-0">
        {/* Background Image Slider with Synced Slides */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img 
              key={currentBgIdx}
              src={heroSlides[currentBgIdx].bg} 
              alt="Community Empowerment" 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ 
                x: { duration: 1.2, ease: [0.25, 1, 0.5, 1] },
                opacity: { duration: 0.8 }
              }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
            />
          </AnimatePresence>
          {/* Specific Dark Gradient Overlay - Left-to-Right for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent z-10"></div>
        </div>

        <div className="max-w-[95%] sm:max-w-[90%] mx-auto relative z-20 w-full flex items-center pt-20 pb-8 md:pt-0 md:pb-0">
          <div className="w-full max-w-5xl text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBgIdx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="space-y-4 sm:space-y-6 md:space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 text-white rounded-full text-xs md:text-sm font-bold uppercase tracking-widest w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {heroSlides[currentBgIdx].badge}
                </div>
                
                <h1 className="text-[clamp(1.75rem,6.2vw,4.85rem)] font-black text-white tracking-tighter leading-[1.1] flex flex-col justify-start">
                  <span className="block">{heroSlides[currentBgIdx].titleLine1}</span>
                  <span className={`block my-1 ${heroSlides[currentBgIdx].titleLine2Color}`}>
                    {heroSlides[currentBgIdx].titleLine2}
                  </span>
                  <span className="block">{heroSlides[currentBgIdx].titleLine3}</span>
                </h1>
                  
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 leading-relaxed font-medium max-w-2xl opacity-90">
                  {heroSlides[currentBgIdx].description}
                </p>
                
                <div className="flex flex-row items-center gap-2 sm:gap-4 pt-2">
                  <Link to="/projects" className="px-4 py-2 sm:px-8 sm:py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-base shrink-0">
                    View Our Work <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />
                  </Link>
                  <Link to="/contact" className="px-4 py-2 sm:px-8 sm:py-3.5 bg-transparent text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/10 transition-all flex items-center justify-center text-[11px] sm:text-base shrink-0">
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Points (Dots) for Carousel Control */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/25 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentBgIdx(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentBgIdx === index 
                  ? "w-8 bg-primary" 
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section - Clean layout below hero */}
      <section className="py-12 md:py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-green-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <stat.icon size={20} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1">
                  <AnimatedCounter value={stat.value} />
                </h3>
                <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 md:py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2">
              <img 
                src={communityimg}
                alt="Community work" 
                loading="lazy"
                className="rounded-2xl shadow-xl object-cover w-full aspect-video md:aspect-[4/3]"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Who We Are</h4>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Building a Better Future Together</h2>
              <p className="text-slate-600 mb-6 text-base sm:text-lg leading-relaxed">
                Vanvasi Pragati Mandal Pipaliya is a non-profit organization dedicated to the holistic development of rural and tribal areas. 
                Founded by Sangada Devisingbhai, our mission is to bridge the gap between resources and those who need them most.
              </p>
              <p className="text-slate-600 mb-8 text-base sm:text-lg leading-relaxed">
                We work closely with the government and local communities to execute transparent, high-impact projects.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-secondary font-bold hover:text-blue-800 transition-all text-base group/link"
              >
                <span>Read More About Us</span>
                <ArrowRight size={18} className="transform group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Our Impact</h4>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Projects</h2>
            </div>
            {featuredProjects.length > 3 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setStartIndex(prev => (prev - 1 + featuredProjects.length) % featuredProjects.length)}
                  className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-primary transition-all shadow-sm active:scale-90 cursor-pointer"
                  title="Previous Projects"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setStartIndex(prev => (prev + 1) % featuredProjects.length)}
                  className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-primary transition-all shadow-sm active:scale-90 cursor-pointer"
                  title="Next Projects"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          
          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-white/50 animate-pulse rounded-2xl border border-slate-100"></div>
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
               <p className="text-slate-500 font-medium">No projects available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {visibleProjects.map((project, index) => {
                const projectId = project.uuid || project.id;
                const imageUrl = project.main_image_url || (project.images && project.images.length > 0 ? `${project.images.find(img => img.is_main)?.image_url || project.images[0].image_url}` : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80');
                
                return (
                  <motion.div 
                    key={projectId}
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
                        src={imageUrl} 
                        alt={project.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-slate-600 mb-6 text-sm sm:text-base line-clamp-3 flex-grow">{project.description}</p>
                      <Link 
                      to={projectId ? `/projects/${projectId}` : "#"} 
                      className="text-secondary font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto w-fit"
                    >
                      Read Case Study <ArrowRight size={16} />
                    </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          <div className="mt-12 flex justify-end">
            <Link 
              to="/projects" 
              className="inline-flex items-center gap-2 text-secondary font-bold hover:text-blue-800 transition-all text-base group"
            >
              <span>View All Projects</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Success Story Carousel */}
      <section className="pt-16 pb-6 md:pt-24 md:pb-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Success Stories</h4>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">Voices of Change</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between shadow-sm ${
                  idx % 2 === 0 
                    ? 'bg-slate-50 border-slate-100' 
                    : 'bg-primary/5 border-primary/10'
                }`}
              >
                <p className="text-sm sm:text-base md:text-lg text-slate-700 italic font-medium leading-relaxed mb-6">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-100" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0 flex items-center justify-center text-slate-500 font-bold text-sm">
                      {item.name ? item.name.charAt(0) : 'V'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                    <p className="text-slate-500 text-sm">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQ />

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-14 overflow-hidden relative group">
            <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_3.8fr] gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Stay Updated with <br className="hidden sm:inline" />Our <span className="text-primary">Impact Stories</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-md">
                  Join our monthly newsletter to get updates on new projects, success stories, and ways you can help.
                </p>
              </div>
              
              <div>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 relative">
                  <input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    required
                    disabled={subscribeStatus === 'loading'}
                    className="flex-grow px-5 py-3.5 sm:px-8 sm:py-4.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base md:text-lg disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={subscribeStatus === 'loading'}
                    className="px-6 py-3.5 sm:px-10 sm:py-4.5 bg-primary text-white font-bold rounded-xl sm:rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 text-sm sm:text-base md:text-lg whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                  </button>
                </form>
                
                {subscribeMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 px-4 py-3 rounded-xl border text-sm ${
                      subscribeStatus === 'success' 
                        ? 'bg-green-500/20 border-green-500/50 text-green-200' 
                        : 'bg-red-500/20 border-red-500/50 text-red-200'
                    }`}
                  >
                    {subscribeMessage}
                  </motion.div>
                )}
                
                <p className="mt-4 text-slate-500 text-xs sm:text-sm">
                  We respect your privacy. No spam, only impact updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary opacity-20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 md:mb-6">Support Our Mission</h2>
          <p className="text-green-50 text-base sm:text-lg lg:text-xl mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
            Together we can make a difference. Partner with us, volunteer, or contribute to bring positive change to the lives of thousands.
          </p>
          <Link 
            to="/contact"
            className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-green-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-black/10 text-base sm:text-lg"
          >
            Join Us Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default React.memo(Home);
