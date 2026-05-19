import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
    Upload, Trash2, Image as ImageIcon, Search, Filter, 
    X, Eye, Calendar, UploadCloud, CheckCircle2
} from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles) => {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
        setFiles(prev => [...prev, ...imageFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        
        const data = new FormData();
        files.forEach(file => data.append('images', file));

        try {
            await api.post('/gallery/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUploadSuccess();
            onClose();
            setFiles([]);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <UploadCloud className="text-primary" /> Upload Images
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleChange} />
                            <div className="w-16 h-16 bg-blue-50 text-secondary rounded-full flex items-center justify-center mb-4">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-lg font-bold text-slate-700 mb-2">Drag & Drop images here</p>
                            <p className="text-slate-500 text-sm">or click to browse from your computer</p>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Selected Files ({files.length})</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                                                <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                        <button onClick={handleUpload} disabled={files.length === 0 || uploading} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:shadow-none flex items-center gap-2">
                            {uploading ? 'Uploading...' : 'Upload Now'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const Lightbox = ({ image, onClose }) => {
    if (!image) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
                <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 z-10 transition-all">
                    <X size={32} />
                </button>
                <div className="relative z-10 flex flex-col items-center max-w-5xl w-full">
                    <motion.img 
                        initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}
                        src={`${image.image_url}`} 
                        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10" 
                    />
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="mt-6 text-center text-white">
                        <p className="font-medium text-lg">{image.image_url.split('/').pop()}</p>
                        <p className="text-white/60 text-sm mt-1 flex items-center justify-center gap-2">
                            <Calendar size={14} /> {new Date(image.created_at).toLocaleDateString()}
                            {image.category && <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">{image.category}</span>}
                        </p>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

const GalleryManager = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [toast, setToast] = useState(null);

    // Multi-select and checkbox mode
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedUuids, setSelectedUuids] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await api.get('/gallery');
            console.log('GET /gallery response:', response.data);
            if (Array.isArray(response.data)) {
                setImages(response.data);
            } else {
                console.error('Expected array for gallery but got:', response.data);
                setImages([]);
            }
        } catch (err) {
            console.error('Failed to fetch gallery. Details:', JSON.stringify(err.response?.data || err.message));
            showToast('Failed to load gallery', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await api.delete(`/gallery/${id}`);
                setImages(images.filter(img => img.id !== id));
                showToast('Image deleted successfully');
            } catch (err) {
                showToast('Failed to delete image', 'error');
            }
        }
    };

    const toggleSelectImage = (uuid) => {
        setSelectedUuids(prev => 
            prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
        );
    };

    const handleSelectAll = () => {
        setSelectedUuids(filteredImages.map(img => img.uuid || img.id));
    };

    const handleDeselectAll = () => {
        setSelectedUuids([]);
    };

    const handleBulkDelete = async () => {
        if (selectedUuids.length === 0) return;
        if (window.confirm(`Are you sure you want to delete the ${selectedUuids.length} selected images?`)) {
            try {
                await Promise.all(selectedUuids.map(id => api.delete(`/gallery/${id}`)));
                setImages(prev => prev.filter(img => !selectedUuids.includes(img.uuid || img.id)));
                setSelectedUuids([]);
                setIsSelectMode(false);
                showToast('Selected images deleted successfully');
            } catch (err) {
                console.error("Bulk delete failed", err);
                showToast('Failed to delete some images', 'error');
                fetchImages();
            }
        }
    };

    const handleUploadSuccess = () => {
        fetchImages();
        showToast('Images uploaded successfully!');
    };

    // Filter logic
    const categories = ['All', ...new Set(images.map(img => img.category).filter(Boolean))];
    
    const filteredImages = images.filter(img => {
        const matchesSearch = img.image_url.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === 'All' || img.category === categoryFilter;
        return matchesSearch && matchesCat;
    }).sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return (
        <AdminLayout>
            {/* Custom Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}
                    >
                        {toast.type === 'success' && <CheckCircle2 size={18} className="text-primary" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-secondary rounded-xl flex items-center justify-center">
                                <ImageIcon size={20} />
                            </div>
                            Gallery Management
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage and organize your beautiful project images.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => {
                                setIsSelectMode(!isSelectMode);
                                setSelectedUuids([]);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isSelectMode ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {isSelectMode ? 'Cancel Selection' : 'Select Photos'}
                        </button>
                        <button 
                            onClick={() => setUploadModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                        >
                            <UploadCloud size={20} /> Upload Images
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                {/* Controls Bar */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search images by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-secondary focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shrink-0">
                            <Filter size={16} className="text-slate-400" />
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shrink-0">
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ImageIcon size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">No images found</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                {searchTerm || categoryFilter !== 'All' 
                                    ? "We couldn't find any images matching your current filters. Try clearing them to see all images."
                                    : "Your gallery is currently empty. Start uploading some beautiful project images to showcase your work!"}
                            </p>
                            <button onClick={() => setUploadModalOpen(true)} className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                                Upload First Image
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {filteredImages.map(img => {
                                const imgUuid = img.uuid || img.id;
                                const isSelected = selectedUuids.includes(imgUuid);
                                return (
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        key={img.id} 
                                        onClick={() => {
                                            if (isSelectMode) {
                                                toggleSelectImage(imgUuid);
                                            } else {
                                                setLightboxImage(img);
                                            }
                                        }}
                                        className={`group relative aspect-square rounded-2xl overflow-hidden shadow-sm border bg-slate-50 cursor-pointer transition-all ${
                                            isSelected ? 'ring-4 ring-secondary border-transparent scale-95' : 'border-slate-100'
                                        }`}
                                    >
                                        <img 
                                            src={`${img.image_url}`} 
                                            alt="Gallery" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                        />
                                        
                                        {/* Selection Checkbox Overlay */}
                                        {isSelectMode && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="w-6 h-6 rounded-lg text-secondary border-slate-300 focus:ring-secondary accent-blue-500 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        {!isSelectMode && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage(img); }}
                                                        className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-colors"
                                                        title="View Fullscreen"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(imgUuid); }}
                                                        className="p-2.5 bg-red-500/80 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-colors"
                                                        title="Delete Image"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                
                                                <div className="translate-y-[10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                                                    <p className="text-white font-medium truncate text-sm mb-1">{String(img.image_url || '').split('/').pop()}</p>
                                                    <div className="flex items-center gap-2 text-white/70 text-xs">
                                                        <Calendar size={12} />
                                                        <span>{new Date(img.created_at || Date.now()).toLocaleDateString()}</span>
                                                        {img.category && (
                                                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] ml-auto">{String(img.category)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>

            <UploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
            <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

            {/* Bulk Deletion Floating Bottom Bar */}
            <AnimatePresence>
                {isSelectMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-slate-900/95 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-6 backdrop-blur-md w-[90%] max-w-2xl justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <span className="bg-secondary text-white font-black px-3 py-1.5 rounded-xl text-sm">
                                {selectedUuids.length} selected
                            </span>
                            <span className="text-slate-400 text-sm hidden sm:inline">of {filteredImages.length} images</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={selectedUuids.length === filteredImages.length ? handleDeselectAll : handleSelectAll}
                                className="px-4 py-2 hover:bg-white/10 rounded-xl font-bold transition-colors text-sm"
                            >
                                {selectedUuids.length === filteredImages.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedUuids.length === 0}
                                className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-lg shadow-red-500/25"
                            >
                                <Trash2 size={16} /> Delete Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default GalleryManager;
