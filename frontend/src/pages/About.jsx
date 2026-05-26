import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Award, 
  Phone, 
  Mail, 
  Loader2, 
  ShieldCheck, 
  TrendingUp, 
  Heart, 
  Compass, 
  Users, 
  BookOpen 
} from 'lucide-react';
import api from '../api/axios';
import communityimg from '../assets/communityphoto.png';
import presidentimg from '../assets/president.jpg';
import coordinatorimg from '../assets/coordinator.jpg';

const DEFAULT_ABOUT = {
  mission: "To empower rural and tribal communities through sustainable development initiatives, providing access to quality education, healthcare, and essential infrastructure, thereby ensuring self-reliance and improved standards of living.",
  vision: "A society where every individual, regardless of their background or geographical location, has equal opportunities to thrive, contribute, and live with dignity in a supportive and self-sustaining community.",
  story: "Established with a profound commitment to uplift the marginalized, Vanvasi Pragati Mandal Pipaliya has been a beacon of hope for tribal and rural populations across Gujarat. We act as a crucial link between government resources, benevolent donors, and local community representatives at the grassroots level.\n\nOur approach is rooted in community-driven planning, radical financial accountability, and long-term sustainability. Every project we launch—whether building local clean water systems, conducting primary healthcare camps, or supporting children's education—is co-designed with village leadership to foster self-reliance rather than dependency.",
  team: [
    {
      name: "Sangada Devisingbhai",
      role: "Founder & President",
      image: "",
      contact: "+91 7874789633",
      email: "",
      bio: "With over two decades of experience in social work, Devisingbhai founded this trust to bring structured development to his native region. His relentless dedication has transformed countless lives."
    },
    {
      name: "Kartikkumar Sangada",
      role: "Core Member & Coordinator",
      image: "",
      contact: "+91 8140255951",
      email: "kartiksangada2004@gmail.com",
      bio: "Kartikkumar oversees the operational execution of projects. His expertise in ground-level management ensures that initiatives reach their intended beneficiaries efficiently."
    }
  ]
};

const About = () => {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/content/about')
      .then(({ data }) => {
        if (data && (data.mission || data.vision || data.story)) {
          setAbout({
            mission: data.mission || DEFAULT_ABOUT.mission,
            vision: data.vision || DEFAULT_ABOUT.vision,
            story: data.story || DEFAULT_ABOUT.story,
            team: Array.isArray(data.team) && data.team.length > 0 ? data.team : DEFAULT_ABOUT.team
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch dynamic about narrative, relying on default fallbacks:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const coreValues = [
    {
      title: "Community Leadership",
      gujaratiTitle: "લોક ભાગીદારી",
      description: "True development starts from within. We do not impose solutions; instead, we partner directly with village panchayats and community leaders to co-design every initiative, ensuring local ownership.",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      hoverClass: "hover:border-emerald-500/30 hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.12)]"
    },
    {
      title: "Radical Transparency",
      gujaratiTitle: "સંપૂર્ણ પારદર્શિતા",
      description: "Trust is our most valuable asset. We maintain clear and audited financial records, providing complete visibility of resources to our donors, regulatory authorities, and community beneficiaries.",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      hoverClass: "hover:border-blue-500/30 hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.12)]"
    },
    {
      title: "Inclusivity & Dignity",
      gujaratiTitle: "સર્વસમાવેશકતા",
      description: "We serve without prejudice. Our focus is strictly on empowering the most marginalized rural sections, with dedicated attention to female literacy, child healthcare, and elderly assistance.",
      icon: Heart,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      hoverClass: "hover:border-rose-500/30 hover:shadow-[0_25px_50px_-12px_rgba(244,63,94,0.12)]"
    },
    {
      title: "Sustainable Progress",
      gujaratiTitle: "લાંબાગાળાની અસર",
      description: "We focus on building capabilities rather than promoting dependency. Our goal is to set up infrastructure and training programs that communities can maintain independently in the long run.",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      hoverClass: "hover:border-amber-500/30 hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.12)]"
    }
  ];

  const workMethodology = [
    {
      step: "01",
      title: "Assess & Listen",
      description: "We sit down with local villagers and elders to listen to their immediate needs. We map gaps in drinking water, primary learning, or medicine access before making any plans.",
      icon: Compass
    },
    {
      step: "02",
      title: "Mobilize & Implement",
      description: "We co-create direct, cost-efficient budgets and recruit local youth coordinators. Projects are executed using robust materials and community labor to ensure buy-in.",
      icon: Users
    },
    {
      step: "03",
      title: "Review & Empower",
      description: "Once installed, projects undergo regular audits. We hand over operations to a village committee, establishing self-maintenance protocols so the work thrives permanently.",
      icon: Award
    }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-24 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={44} />
        <p className="text-slate-500 font-extrabold text-sm tracking-wide">Loading trust narratives...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 bg-slate-50/50">
      {/* Page Header */}
      <div className="bg-slate-50 pt-28 pb-10 sm:pt-36 sm:pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">About Us</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the driving force, vision, and core team behind Vanvasi Pragati Mandal Pipaliya.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-100/50 border border-slate-100"
          >
            <div className="w-14 h-14 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              {about.mission}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-100/50 border border-slate-100"
          >
            <div className="w-14 h-14 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center mb-6">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              {about.vision}
            </p>
          </motion.div>
        </div>

        {/* Organization Info */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Who We Are</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-[250px] md:h-auto md:min-h-[440px]">
              <img 
                src={communityimg} 
                alt="Community Group" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-14 flex flex-col justify-center bg-white">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Vanvasi Pragati Mandal Pipaliya</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                {about.story.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <ul className="space-y-3 mt-8">
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <Award className="text-primary shrink-0" size={20} /> Registered Trust (Charity Comm. Reg.)
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <Award className="text-primary shrink-0" size={20} /> Grassroots Partner in Tribal Gujarat
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <Award className="text-primary shrink-0" size={20} /> Tax Exemption Eligible (Section 80G Approval)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Core Values Section (New) */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm">
              These guiding principles form the moral backbone of every project, decision, and campaign we run.
            </p>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -8, scale: 1.015 }}
                className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.02)] flex flex-col items-start transition-all duration-300 ease-out group ${value.hoverClass}`}
              >
                <div className={`p-4.5 rounded-2xl border mb-6 transition-all duration-300 group-hover:scale-110 shadow-sm ${value.color}`}>
                  <value.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3.5 flex flex-col">
                  <span className="leading-snug">{value.title}</span>
                  <span className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-wider">({value.gujaratiTitle})</span>
                </h3>
                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed font-medium flex-grow">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>


        {/* Our Approach / Work Methodology Section (Redesigned) */}
        <div className="mb-24 bg-gradient-to-br from-primary via-emerald-800 to-teal-950 rounded-[2rem] p-8 sm:p-12 md:p-16 text-white relative overflow-hidden shadow-2xl border border-emerald-500/10">
          {/* Enhanced Glassmorphic Blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-400 opacity-15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-lime-300 opacity-10 rounded-full blur-2xl"></div>

          <div className="text-center mb-14 relative z-10">
            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-widest text-emerald-300 mb-4 inline-block">
              How We Work
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              Our Operational Approach
            </h2>
            <p className="text-emerald-100/90 max-w-xl mx-auto font-medium text-sm sm:text-base leading-relaxed">
              We employ a continuous, audit-backed process to ensure every rupee translates into long-term self-sufficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {workMethodology.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.215, 0.61, 0.355, 1] }}
                className="group bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-white/20 flex flex-col items-start hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-950/30"
              >
                <div className="flex justify-between items-center w-full mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-md">
                    <item.icon size={26} className="transition-transform duration-300" />
                  </div>
                  <span className="text-5xl font-black bg-gradient-to-b from-white/30 to-white/0 bg-clip-text text-transparent select-none font-mono tracking-tighter">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-emerald-100/75 text-xs sm:text-sm leading-relaxed font-medium group-hover:text-white transition-colors">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Leadership</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {about.team.map((member, index) => {
              // Determine portrait avatar fallback
              let avatar = member.image;
              if (!avatar) {
                avatar = index === 0 ? presidentimg : coordinatorimg;
              } else if (avatar.includes('president.jpg') || avatar.includes('assets/president')) {
                avatar = presidentimg;
              } else if (avatar.includes('coordinator.jpg') || avatar.includes('assets/coordinator')) {
                avatar = coordinatorimg;
              }

              return (
                <div 
                  key={index}
                  className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${index === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={avatar} 
                      alt={member.name} 
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = index === 0 ? presidentimg : coordinatorimg;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1 leading-tight">{member.name}</h3>
                  <p className={`font-bold mb-3 text-xs uppercase tracking-wider ${index === 0 ? 'text-primary' : 'text-secondary'}`}>
                    {member.role}
                  </p>
                  <p className="text-slate-500 mb-5 text-sm font-medium leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="space-y-1.5 flex flex-col items-center text-xs text-slate-400 font-bold border-t pt-4">
                    {member.contact && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-300" /> {member.contact}
                      </span>
                    )}
                    {member.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-300" /> {member.email}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(About);
