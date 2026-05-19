import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Phone, Mail, Loader2 } from 'lucide-react';
import api from '../api/axios';
import communityimg from '../assets/communityphoto.png';
import presidentimg from '../assets/president.jpg';
import coordinatorimg from '../assets/coordinator.jpg';

const DEFAULT_ABOUT = {
  mission: "To empower rural and tribal communities through sustainable development initiatives, providing access to quality education, healthcare, and essential infrastructure, thereby ensuring self-reliance and improved standards of living.",
  vision: "A society where every individual, regardless of their background or geographical location, has equal opportunities to thrive, contribute, and live with dignity in a supportive and self-sustaining community.",
  story: "Established with a profound commitment to uplift the marginalized, Vanvasi Pragati Mandal Pipaliya has been a beacon of hope for tribal and rural populations. We act as a crucial link between government resources, benevolent donors, and the people at the grassroots level.\n\nOur approach is rooted in transparency, accountability, and real impact. Every project we undertake is meticulously planned and executed with community participation to ensure long-term sustainability.",
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

  if (loading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-24 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={44} />
        <p className="text-slate-500 font-extrabold text-sm tracking-wide">Loading trust narratives...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 pt-20 bg-slate-50/50">
      {/* Page Header */}
      <div className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">About Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the driving force, vision, and people behind Vanvasi Pragati Mandal Pipaliya.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
            <div className="md:w-1/2 min-h-[300px]">
              <img 
                src={communityimg} 
                alt="Community Group" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Vanvasi Pragati Mandal Pipaliya</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                {about.story.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <ul className="space-y-3 mt-8">
                <li className="flex items-center gap-3 text-slate-700 font-bold">
                  <Award className="text-primary" size={20} /> Registered Trust
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold">
                  <Award className="text-primary" size={20} /> Government Approved Partner
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold">
                  <Award className="text-primary" size={20} /> Tax Exemptions Available (80G)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Leadership</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                  className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center relative overflow-hidden group hover:shadow-xl transition-all"
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${index === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                  <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-6 overflow-hidden border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
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
                  <h3 className="text-2xl font-black text-slate-900 mb-1 leading-tight">{member.name}</h3>
                  <p className={`font-extrabold mb-4 text-sm uppercase tracking-wider ${index === 0 ? 'text-primary' : 'text-secondary'}`}>
                    {member.role}
                  </p>
                  <p className="text-slate-500 mb-6 text-sm font-medium leading-relaxed min-h-[60px]">
                    {member.bio}
                  </p>
                  <div className="space-y-1.5 flex flex-col items-center text-xs text-slate-400 font-bold border-t pt-4">
                    {member.contact && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-300" /> {member.contact}
                      </span>
                    )}
                    {member.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-300" /> {member.email}
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
