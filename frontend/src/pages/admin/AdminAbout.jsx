import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';
import { 
  Target, Eye, Users, FileText, Plus, Trash2, Save, Edit,
  Sparkles, Info, Search, Upload, X, Loader2, CheckCircle2,
  Mail, Phone
} from 'lucide-react';

const AdminAbout = () => {
  const [about, setAbout] = useState({ mission: '', vision: '', story: '', team: [] });
  const [loading, setLoading] = useState(true);
  
  // Tab states: 'about', 'team'
  const [activeTab, setActiveTab] = useState('about');
  
  // Searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Committed search

  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(false); // Used as boolean loading for upload inside modal
  const [toast, setToast] = useState(null);
  
  // Modal editor states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState(null); // null means adding
  const [teamForm, setTeamForm] = useState({ name: '', role: '', image: '', contact: '', email: '', bio: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/content/about')
      .then((a) => {
        if (a?.data) {
          setAbout({
            mission: '',
            vision: '',
            story: '',
            team: [],
            ...a.data
          });
        }
      })
      .catch((err) => console.error("Failed to load about data", err))
      .finally(() => setLoading(false));
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

  const removeTeamMember = async (index) => {
    if (window.confirm(`Are you sure you want to remove this team member?`)) {
      const updatedTeam = (about.team || []).filter((_, i) => i !== index);
      const updatedAbout = { ...about, team: updatedTeam };
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
      const response = await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTeamForm(prev => ({ ...prev, image: response.data.image_url }));
      showToast('Profile image uploaded successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to upload image. Must be a supported image file.';
      showToast(errMsg, 'error');
    } finally {
      setUploadingIndex(false);
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
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-white transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-slate-900'}`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

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
            <p className="text-slate-500 mt-2 font-medium">Manage your NGO profile narrative and leadership profiles.</p>
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
                <p className="text-slate-500 text-xs">Configure your primary organizational statements and mission parameters.</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveAbout(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Target size={14} className="text-primary" /> Our Core Mission Statement
                  </label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px] resize-none leading-relaxed"
                    required
                    placeholder="Enter the primary mission statement..."
                    value={about.mission}
                    onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Eye size={14} className="text-primary" /> Our Future Vision Statement
                  </label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px] resize-none leading-relaxed"
                    required
                    placeholder="Enter the vision statement..."
                    value={about.vision}
                    onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-primary" /> Comprehensive Organization Story & Narrative
                </label>
                <textarea 
                  className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[220px] resize-none leading-relaxed"
                  required
                  placeholder="Enter the comprehensive historical story of the trust..."
                  value={about.story}
                  onChange={(e) => setAbout({ ...about, story: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-extrabold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving Narrative Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Identity Statements
                    </>
                  )}
                </button>
              </div>
            </form>
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
                  <p className="text-slate-500 text-xs">Configure the leadership profiles and coordinate contacts.</p>
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
                  placeholder="Filter leadership by name, role, email contact..." 
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

            {/* Redesigned Leadership Grid List */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 px-6">Profile</th>
                    <th className="p-4 px-6">Contact & Details</th>
                    <th className="p-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {filteredTeam.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-slate-400 italic font-medium">
                        {searchQuery ? "No members matched your search filter." : "No team members saved yet. Click 'Add Team Member' to create one."}
                      </td>
                    </tr>
                  ) : (
                    filteredTeam.map(({ originalIndex, ...m }) => (
                      <tr key={originalIndex} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 px-6 flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shadow border shrink-0">
                            {m.image ? (
                              <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 font-bold">
                                {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{m.name || 'Anonymous'}</p>
                            <span className="text-xs text-primary font-bold tracking-tight bg-green-50 px-2 py-0.5 rounded w-fit inline-block mt-1">{m.role || 'Member'}</span>
                          </div>
                        </td>
                        <td className="p-4 px-6 py-5">
                          <div className="space-y-1">
                            {m.email && (
                              <p className="text-slate-600 text-xs flex items-center gap-1.5">
                                <Mail size={12} className="text-slate-400" /> {m.email}
                              </p>
                            )}
                            {m.contact && (
                              <p className="text-slate-600 text-xs flex items-center gap-1.5">
                                <Phone size={12} className="text-slate-400" /> {m.contact}
                              </p>
                            )}
                            {!m.email && !m.contact && (
                              <span className="text-slate-400 text-xs italic">No coordinates provided.</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 px-6 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openTeamModal(originalIndex)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Member"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => removeTeamMember(originalIndex)}
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

      </div>

      {/* Modals and Overlay Blocks */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsTeamModalOpen(false)}
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
                    <p className="text-xs text-slate-500">Configure profile coordinates and metadata parameters</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <form onSubmit={handleSaveTeamMember} className="space-y-5">
                  
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="relative w-16 h-16 rounded-xl bg-slate-200 border overflow-hidden shrink-0 flex items-center justify-center">
                      {teamForm.image ? (
                        <img src={teamForm.image} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="text-slate-400" size={24} />
                      )}
                      {uploadingIndex && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white">
                          <Loader2 size={16} className="animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-4 py-2 border rounded-xl hover:bg-white transition-all bg-slate-100 text-xs font-extrabold flex items-center gap-1"
                      >
                        <Upload size={14} /> Upload Avatar Image
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1">Recommended size: 200x200 PNG/JPG format.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Kartikkumar Sangada" 
                        value={teamForm.name} 
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Role / Designation</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        required
                        placeholder="e.g. Executive Trustee" 
                        value={teamForm.role} 
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        placeholder="e.g. info@vanvasi.org" 
                        value={teamForm.email} 
                        onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Mobile</label>
                      <input 
                        type="tel"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        placeholder="e.g. +91 99999 99999" 
                        value={teamForm.contact} 
                        onChange={(e) => setTeamForm({ ...teamForm, contact: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Short Professional Bio</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px] resize-none leading-relaxed" 
                      placeholder="Type a brief profile biography or background description here..." 
                      value={teamForm.bio} 
                      onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })} 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsTeamModalOpen(false)}
                      className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Save size={18} /> Save Team Profile
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
