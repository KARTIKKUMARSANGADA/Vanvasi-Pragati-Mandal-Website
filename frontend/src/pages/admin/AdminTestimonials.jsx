import { useState, useEffect } from 'react';
import { Quote, Plus, Edit, Trash2, Save, Upload, CheckCircle2, AlertCircle, Loader2, User, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal state for add/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIdx, setEditIdx] = useState(null); // null if adding new
    
    // Form fields
    const [quote, setQuote] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        onConfirm: () => {}
    });

    const triggerConfirm = ({ title, message, confirmText, cancelText, onConfirm }) => {
        setConfirmModal({
            isOpen: true,
            title: title || 'Are you sure?',
            message: message || '',
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel',
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const fetchTestimonials = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/content/testimonials');
            setTestimonials(data || []);
        } catch (err) {
            console.error("Failed to load testimonials:", err);
            setError("Could not load dynamic success stories from registry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const openAddModal = () => {
        setEditIdx(null);
        setQuote('');
        setName('');
        setRole('');
        setImageUrl('');
        setIsModalOpen(true);
    };

    const openEditModal = (idx) => {
        const item = testimonials[idx];
        setEditIdx(idx);
        setQuote(item.quote || '');
        setName(item.name || '');
        setRole(item.role || '');
        setImageUrl(item.image || '');
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/content/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImageUrl(data.image_url);
            showSuccess("Beneficiary avatar uploaded successfully!");
        } catch (err) {
            console.error("Failed to upload testimonial avatar:", err);
            setError("Failed to upload avatar image. File size must be under 5MB.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        
        const payload = {
            quote,
            name,
            role,
            image: imageUrl || null
        };

        if (editIdx === null) {
            // Add new
            setTestimonials(prev => [...prev, payload]);
        } else {
            // Edit existing
            setTestimonials(prev => prev.map((item, idx) => idx === editIdx ? payload : item));
        }
        
        setIsModalOpen(false);
    };

    const handleDelete = (idx) => {
        triggerConfirm({
            title: "Remove Testimonial",
            message: "Are you sure you want to remove this testimonial from the registry?",
            confirmText: "Remove",
            cancelText: "Cancel",
            onConfirm: () => {
                setTestimonials(prev => prev.filter((_, i) => i !== idx));
            }
        });
    };

    const handleSaveRegistry = async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await api.put('/content/testimonials', {
                items: testimonials
            });
            showSuccess("Voices of Change testimonial registry synchronized successfully!");
        } catch (err) {
            console.error("Failed to save testimonials registry:", err);
            setError("Could not synchronize testimonials registry with Supabase.");
        } finally {
            setSaving(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <AdminLayout title="Dynamic Success Stories Manager">
            <div className="space-y-8">
                {/* Intro details */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                            <Quote size={20} className="text-primary fill-primary/10" />
                            Voices of Change Testimonials
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Manage and customize beneficiary success records visible on the main landing page</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto shrink-0">
                        <button
                            onClick={openAddModal}
                            className="px-5 py-3 bg-slate-900 text-white text-sm font-extrabold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Success Story
                        </button>
                        <button
                            onClick={handleSaveRegistry}
                            disabled={saving}
                            className="px-5 py-3 bg-primary text-white text-sm font-extrabold rounded-xl hover:bg-primary-hover shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving Registry...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Sync to Homepage
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-center gap-3 font-semibold text-sm">
                        <AlertCircle className="text-red-600 shrink-0" size={20} />
                        <div>{error}</div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-xl flex items-center gap-3 font-semibold text-sm">
                        <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                        <div>{successMessage}</div>
                    </div>
                )}

                {/* Main panel listings */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-slate-500 font-semibold">Synchronizing with testimonial registry...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testimonials.length === 0 ? (
                            <div className="col-span-2 py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
                                <Quote size={48} className="mx-auto mb-4 text-slate-300 fill-slate-50" />
                                <p className="font-bold text-slate-500">No dynamic success stories listed. Add one to begin!</p>
                            </div>
                        ) : (
                            testimonials.map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative group">
                                    <div className="space-y-4">
                                        <div className="text-primary opacity-20">
                                            <Quote size={40} className="fill-primary" />
                                        </div>
                                        <p className="text-slate-600 font-medium italic text-base leading-relaxed">
                                            "{item.quote}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <User size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{item.name}</h4>
                                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{item.role}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(idx)}
                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                                title="Edit Story"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove Story"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Success Story Form Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
                            <div>
                                <h3 className="font-extrabold text-xl text-slate-900">
                                    {editIdx === null ? "Add Success Story" : "Edit Success Story"}
                                </h3>
                                <p className="text-sm text-slate-500 font-semibold">Write reviews that capture genuine field experiences</p>
                            </div>

                            <form onSubmit={handleModalSubmit} className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beneficiary Quote</label>
                                    <textarea
                                        rows={4}
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        placeholder="The trust organizes everything and covered all cost..."
                                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800 resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beneficiary Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Meena Ben"
                                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-bold text-slate-800"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beneficiary Role</label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="Student / Mother"
                                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-bold text-slate-800"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image Avatar Upload */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beneficiary Profile Photo</label>
                                    <div className="flex items-center gap-4">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                        
                                        <div className="flex-1">
                                            <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-bold text-slate-700 w-fit transition-all">
                                                <Upload size={14} />
                                                {uploadingImage ? "Uploading..." : "Upload Avatar"}
                                                <input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingImage}
                                                />
                                            </label>
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Max 5MB (Compressed automatically)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-3 bg-primary text-white font-extrabold text-sm rounded-xl hover:bg-primary-hover shadow-lg shadow-green-500/10 transition-all"
                                    >
                                        Save Story
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-in duration-200 border border-slate-100 flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            {/* Pulsing Alert icon */}
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 text-red-500 shadow-inner animate-bounce">
                                <AlertTriangle size={28} />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">{confirmModal.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed px-2">
                                    {confirmModal.message}
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all text-sm shadow-sm"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all text-sm"
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTestimonials;
