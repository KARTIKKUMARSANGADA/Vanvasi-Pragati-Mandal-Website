import { motion } from 'framer-motion';
import { Target, Eye, Award } from 'lucide-react';
import communityimg from '../assets/communityphoto.png'
import presidentimg from '../assets/president.jpg'
import coordinatorimg from '../assets/coordinator.jpg'

const About = () => {
  return (
    <div className="w-full pb-24 pt-20">
      {/* Page Header */}
      <div className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">About Us</h1>
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
            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To empower rural and tribal communities through sustainable development initiatives, 
              providing access to quality education, healthcare, and essential infrastructure, 
              thereby ensuring self-reliance and improved standards of living.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
          >
            <div className="w-14 h-14 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center mb-6">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              A society where every individual, regardless of their background or geographical location, 
              has equal opportunities to thrive, contribute, and live with dignity in a supportive 
              and self-sustaining community.
            </p>
          </motion.div>
        </div>

        {/* Organization Info */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Who We Are</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img 
                src={communityimg} 
                alt="Community Group" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Vanvasi Pragati Mandal Pipaliya</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Established with a profound commitment to uplift the marginalized, Vanvasi Pragati Mandal Pipaliya has been a beacon of hope for tribal and rural populations. We act as a crucial link between government resources, benevolent donors, and the people at the grassroots level.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our approach is rooted in transparency, accountability, and real impact. Every project we undertake is meticulously planned and executed with community participation to ensure long-term sustainability.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Award className="text-primary" size={20} /> Registered Trust
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Award className="text-primary" size={20} /> Government Approved Partner
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Award className="text-primary" size={20} /> Tax Exemptions Available (80G)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Leadership</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Founder */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-6 overflow-hidden border-4 border-white shadow-md">
                <img 
                  src={presidentimg} 
                  alt="Sangada Devisingbhai" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Sangada Devisingbhai</h3>
              <p className="text-primary font-semibold mb-4">Founder & President</p>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                With over two decades of experience in social work, Devisingbhai founded this trust to bring structured development to his native region. His relentless dedication has transformed countless lives.
              </p>
              <p className="text-slate-500 font-medium text-sm">Contact: +91 7874789633</p>
            </div>

            {/* Team Member */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>
              <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 mb-6 overflow-hidden border-4 border-white shadow-md">
                <img 
                  src={coordinatorimg} 
                  alt="Kartikkumar Sangada" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Kartikkumar Sangada</h3>
              <p className="text-secondary font-semibold mb-4">Core Member & Coordinator</p>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Kartikkumar oversees the operational execution of projects. His expertise in ground-level management ensures that initiatives reach their intended beneficiaries efficiently.
              </p>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium text-sm">Contact: +91 8140255951</p>
                <p className="text-slate-500 font-medium text-sm">Email: kartiksangada2004@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
