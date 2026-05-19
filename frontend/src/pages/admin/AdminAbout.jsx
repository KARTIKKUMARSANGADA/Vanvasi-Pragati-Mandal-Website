import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';
import { 
  Target, Eye, Users, FileText, Plus, Trash2, Save, Edit,
  Sparkles, Quote, Info, Search, Upload, X, Loader2, CheckCircle2,
  Mail, Phone, ExternalLink
} from 'lucide-react';

const AdminAbout = () => {
  const [about, setAbout] = useState({ mission: '', vision: '', story: '', team: [] });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab states: 'about', 'team', 'testimonials'
  const [activeTab, setActiveTab] = useState('about');
  
  // Searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Committed search

  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null); // Used as boolean loading for upload inside modal
  const [toast, setToast] = useState(null);
  
  // Modal editor states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState(null); // null means adding
  const [teamForm, setTeamForm] = useState({ name: '', role: '', image: '', contact: '', email: '', bio: '' });

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState(null); // null means adding
  const [testimonialForm, setTestimonialForm] = useState({ quote: '', name: '', role: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/content/about').catch(() => ({})),
      api.get('/content/testimonials').catch(() => []),
    ]).then(([a, t]) => {
      if (a?.data) {
        setAbout({
          mission: '',
          vision: '',
          story: '',
          team: [],
          ...a.data
        });
      }
      setTestimonials(Array.isArray(t?.data) ? t.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveAbout = async (customAbout = about) => {
    setSaving(true);
    try {
      await api.put('/content/about', customAbout);
      showToast('About page narrative changes saved successfully!');
    } catch (e) {
      showToast('Failed to save details. Check server connection.', 'error');
    } finally { setSaving(false); }
  };

  const saveTestimonials = async (customTestimonials = testimonials) => {
    setSaving(true);
    try {
      await api.put('/content/testimonials', { items: customTestimonials });
      showToast('Success stories saved successfully!');
    } catch (e) {
      showToast('Failed to save success stories.', 'error');
    } finally { setSaving(false); }
  };

  // Team Management
  const openTeamModal = (index = null) => {
    if (index === null) {
      setEditingTeamIndex(null);
      setTeamForm({ name: '', role: '', image: '', contact: '', email: '', bio: '' });
    } else {
      setEditingTeamIndex(index);
      setTeamForm({
        name: '', role: '', image: '', contact: '', email: '', bio: '',
        ...(about.team[index] || {})
      });
    }
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    const updatedTeam = [...(about.team || [])];
    if (editingTeamIndex === null) {
      updatedTeam.push(teamForm);
    } else {
      updatedTeam[editingTeamIndex] = teamForm;
    }
    const updatedAbout = { ...about, team: updatedTeam };
    setAbout(updatedAbout);
    setIsTeamModalOpen(false);
    await saveAbout(updatedAbout);
  };

  const removeTeam = async (index) => {
    if (window.confirm(`Are you sure you want to remove this team member?`)) {
      const next = (about.team || []).filter((_, i) => i !== index);
      const updatedAbout = { ...about, team: next };
      setAbout(updatedAbout);
      await saveAbout(updatedAbout);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingIndex(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data?.image_url) {
        setTeamForm(prev => ({ ...prev, image: data.image_url }));
        showToast('Profile photo uploaded and compressed successfully!');
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast('Image upload failed. Try again.', 'error');
    } finally {
      setUploadingIndex(null);
    }
  };

  // Testimonials Management
  const openTestimonialModal = (index = null) => {
    if (index === null) {
      setEditingTestimonialIndex(null);
      setTestimonialForm({ quote: '', name: '', role: '' });
    } else {
      setEditingTestimonialIndex(index);
      setTestimonialForm({
        quote: '', name: '', role: '',
        ...(testimonials[index] || {})
      });
    }
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    const updatedTestimonials = [...testimonials];
    if (editingTestimonialIndex === null) {
      updatedTestimonials.push(testimonialForm);
    } else {
      updatedTestimonials[editingTestimonialIndex] = testimonialForm;
    }
    setTestimonials(updatedTestimonials);
    setIsTestimonialModalOpen(false);
    await saveTestimonials(updatedTestimonials);
  };

  const removeTestimonial = async (index) => {
    if (window.confirm(`Are you sure you want to remove this success story?`)) {
      const updatedTestimonials = testimonials.filter((_, i) => i !== index);
      setTestimonials(updatedTestimonials);
      await saveTestimonials(updatedTestimonials);
    }
  };

  // Searching & Filtering
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  const filteredTeam = (about.team || []).map((m, originalIndex) => ({ ...m, originalIndex })).filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (m.name || '').toLowerCase().includes(query) ||
           (m.role || '').toLowerCase().includes(query) ||
           (m.bio || '').toLowerCase().includes(query) ||
           (m.email || '').toLowerCase().includes(query) ||
           (m.contact || '').toLowerCase().includes(query);
  });

  const filteredTestimonials = testimonials.map((t, originalIndex) => ({ ...t, originalIndex })).filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (t.name || '').toLowerCase().includes(query) ||
           (t.role || '').toLowerCase().includes(query) ||
           (t.quote || '').toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-slate-500 font-bold">Loading Organization Contents...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-white transition-all transform animate-fade-in ${toast.type === 'error' ? 'bg-red-500' : 'bg-slate-900'}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header Block */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                <Info size={20} />
              </div>
              About & Dynamic Content
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your NGO profile narrative, leadership profiles, and success stories.</p>
          </div>
        </div>
      </div>

      {/* Premium Horizontal Navigation Tab Bar */}
      <div className="flex border-b border-slate-200 mb-8 max-w-5xl overflow-x-auto custom-scrollbar">
        <button
          onClick={() => { setActiveTab('about'); clearSearch(); }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'about' ? 'border-primary text-primary font-black' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Sparkles size={16} /> Organization Identity
        </button>
        <button
          onClick={() => { setActiveTab('team'); clearSearch(); }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'team' ? 'border-primary text-primary font-black' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Users size={16} /> Leadership Team
        </button>
        <button
          onClick={() => { setActiveTab('testimonials'); clearSearch(); }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'testimonials' ? 'border-primary text-primary font-black' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Quote size={16} /> Success Stories
        </button>
      </div>

      <div className="max-w-5xl">

        {/* Tab 1: ABOUT PAGE TEXT CONTENT */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">Organization Identity</h2>
                <p className="text-slate-500 text-xs">Manage the mission, vision, and comprehensive story of the Trust.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-primary" /> Our Mission
                </label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-4 min-h-[100px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all leading-relaxed" 
                  placeholder="State the core mission of your organization..." 
                  value={about.mission} 
                  onChange={(e) => setAbout({ ...about, mission: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                  <Eye size={16} className="text-secondary" /> Our Vision
                </label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-4 min-h-[100px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all leading-relaxed" 
                  placeholder="State the long term vision..." 
                  value={about.vision} 
                  onChange={(e) => setAbout({ ...about, vision: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-slate-500" /> Our Story / Who We Are
                </label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-4 min-h-[200px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all leading-relaxed" 
                  placeholder="Write the history and background of the trust..." 
                  value={about.story} 
                  onChange={(e) => setAbout({ ...about, story: e.target.value })} 
                />
              </div>
            </div>
            
            <button 
              type="button" 
              disabled={saving} 
              onClick={() => saveAbout()} 
              className="px-6 py-3.5 bg-primary text-white font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving Identity...' : 'Save Organization Identity'}
            </button>
          </div>
        )}

        {/* Tab 2: LEADERSHIP TEAM */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl text-slate-900">Leadership Team</h2>
                  <p className="text-slate-500 text-xs">Directly manage leaders and upload profiles to the website.</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={() => openTeamModal(null)} 
                className="text-sm font-extrabold bg-primary text-white px-5 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-lg shadow-green-500/20"
              >
                <Plus size={18} /> Add Team Member
              </button>
            </div>

            {/* Search and Filters Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter team by name, role, bio..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                {searchTerm && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors shrink-0 shadow-md">
                Search
              </button>
            </form>

            {/* Redesigned Clean Team Members List Grid */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse whitespace-nowrap bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 px-6">Profile</th>
                    <th className="p-4 px-6">Role & Bio</th>
                    <th className="p-4 px-6">Contact Info</th>
                    <th className="p-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredTeam.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-8 text-slate-400 italic font-medium">
                        {searchQuery ? "No team members matched your search." : "No team members found. Click 'Add Team Member' to create one."}
                      </td>
                    </tr>
                  ) : (
                    filteredTeam.map(({ originalIndex, ...m }) => (
                      <tr key={originalIndex} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold">
                              {m.image ? (
                                <img src={m.image} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; }} />
                              ) : (
                                <Upload size={16} className="text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{m.name || 'Unnamed Member'}</p>
                              <span className="text-xs text-slate-400 font-medium">Leadership Team</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 px-6 max-w-[280px] whitespace-normal break-words">
                          <p className="font-bold text-primary text-xs tracking-tight bg-green-50 px-2 py-0.5 rounded w-fit mb-1">{m.role || 'No Role Assigned'}</p>
                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed" title={m.bio}>{m.bio || 'No biography written.'}</p>
                        </td>
                        <td className="p-4 px-6">
                          <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium">
                            {m.contact && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {m.contact}</span>}
                            {m.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {m.email}</span>}
                            {!m.contact && !m.email && <span className="text-slate-400 italic">None Provided</span>}
                          </div>
                        </td>
                        <td className="p-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openTeamModal(originalIndex)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Member"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => removeTeam(originalIndex)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                  <Quote size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl text-slate-900">Success Stories</h2>
                  <p className="text-slate-500 text-xs">Manage public beneficiary success stories and testimonials.</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={() => openTestimonialModal(null)} 
                className="text-sm font-extrabold bg-primary text-white px-5 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-lg shadow-green-500/20"
              >
                <Plus size={18} /> Add Success Story
              </button>
            </div>

            {/* Search and Filters Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter stories by name, role, quote content..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                {searchTerm && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors shrink-0 shadow-md">
                Search
              </button>
            </form>

            {/* Redesigned Success Stories List */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 px-6">Beneficiary</th>
                    <th className="p-4 px-6">Context & Story</th>
                    <th className="p-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-slate-400 italic font-medium">
                        {searchQuery ? "No stories matched your search filter." : "No success stories saved yet. Click 'Add Success Story' to create one."}
                      </td>
                    </tr>
                  ) : (
                    filteredTestimonials.map(({ originalIndex, ...t }) => (
                      <tr key={originalIndex} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{t.name || 'Anonymous Beneficiary'}</p>
                            <span className="text-xs text-primary font-bold tracking-tight bg-green-50 px-2 py-0.5 rounded w-fit inline-block mt-1">{t.role || 'Beneficiary'}</span>
                          </div>
                        </td>
                        <td className="p-4 px-6 max-w-lg whitespace-normal break-words py-5">
                          <div className="relative">
                            <Quote size={12} className="text-primary/30 absolute -top-1.5 -left-4" />
                            <p className="text-slate-600 text-xs italic font-medium leading-relaxed">
                              {t.quote || 'No success narrative provided.'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 px-6 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openTestimonialModal(originalIndex)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Story"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => removeTestimonial(originalIndex)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Story"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ================= TEAM MEMBER MODAL EDITOR ================= */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => { if (!uploadingIndex) setIsTeamModalOpen(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editingTeamIndex === null ? 'Add Team Member' : 'Edit Team Member'}</h2>
                    <p className="text-xs text-slate-500">Configure public profiles on the organization leadership roster</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  disabled={!!uploadingIndex}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <form onSubmit={handleSaveTeamMember} className="space-y-5">
                  
                  {/* Photo Upload Container Inside Modal */}
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden relative flex items-center justify-center text-slate-400 font-bold mb-3 shadow-inner">
                      {teamForm.image ? (
                        <img src={teamForm.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <Upload size={20} className="mx-auto mb-1 text-slate-300" />
                          <span className="text-[9px] uppercase tracking-wider">No Photo</span>
                        </div>
                      )}
                      {uploadingIndex && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white">
                          <Loader2 className="animate-spin" size={20} />
                        </div>
                      )}
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!uploadingIndex}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <Upload size={14} />
                      {teamForm.image ? 'Change Photo' : 'Upload Profile Photo'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Sangada Devisingbhai" 
                        value={teamForm.name} 
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Role / Title</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Founder & President" 
                        value={teamForm.role} 
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Number</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        placeholder="e.g. +91 7874789633" 
                        value={teamForm.contact} 
                        onChange={(e) => setTeamForm({ ...teamForm, contact: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        type="email"
                        placeholder="e.g. president@vanvasi.org" 
                        value={teamForm.email} 
                        onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Profile Image URL</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50 font-mono" 
                      placeholder="Public URL or auto-populated..." 
                      value={teamForm.image} 
                      onChange={(e) => setTeamForm({ ...teamForm, image: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Biography & Mission</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[80px] resize-none leading-relaxed" 
                      placeholder="Biography details describing their community welfare achievements..." 
                      value={teamForm.bio} 
                      onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })} 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsTeamModalOpen(false)}
                      disabled={!!uploadingIndex}
                      className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={!!uploadingIndex}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Save size={18} /> Save Member Details
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= SUCCESS STORY MODAL EDITOR ================= */}
      <AnimatePresence>
        {isTestimonialModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsTestimonialModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                    <Quote size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editingTestimonialIndex === null ? 'Add Success Story' : 'Edit Success Story'}</h2>
                    <p className="text-xs text-slate-500">Configure beneficiary feedback or testimonials displayed on the homepage</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <form onSubmit={handleSaveTestimonial} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Beneficiary Name</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Ramesh Sangada" 
                        value={testimonialForm.name} 
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Role / Description Context</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Scholarship Recipient" 
                        value={testimonialForm.role} 
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Beneficiary Quote / Success Narrative</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[150px] resize-none leading-relaxed" 
                      required
                      placeholder="Type the full beneficiary quotation or impact story details here..." 
                      value={testimonialForm.quote} 
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsTestimonialModalOpen(false)}
                      className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Save size={18} /> Save Success Story
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
};

export default AdminAbout;
