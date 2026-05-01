import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const ProjectModal = ({ isOpen, onClose, project, onSave }) => {
    const isEdit = !!project;
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        category: 'Education',
        description: '',
        full_description: '',
        location: '',
        date: '',
        impact_points: [],
    });
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [gallerySelections, setGallerySelections] = useState({ existing: [], new: [] });

    useEffect(() => {
        if (isOpen) {
            if (project) {
                setFormData({
                    title: project.title || '',
                    category: project.category || 'Education',
                    description: project.description || '',
                    full_description: project.full_description || '',
                    location: project.location || '',
                    date: project.date || '',
                    impact_points: project.impact_points || [],
                });
                setExistingImages(project.images ? project.images.map(img => img.image_url) : []);
                const existingGalleryUrls = project.images ? project.images.filter(img => img.is_gallery).map(img => img.image_url) : [];
                setGallerySelections({ existing: existingGalleryUrls, new: [] });
            } else {
                setFormData({
                    title: '',
                    category: 'Education',
                    description: '',
                    full_description: '',
                    location: '',
                    date: '',
                    impact_points: [],
                });
                setExistingImages([]);
                setGallerySelections({ existing: [], new: [] });
            }
            setImages([]);
            setPreviewImages([]);
            setDeletedImages([]);
        }
    }, [isOpen, project]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImpactPointChange = (index, value) => {
        const newPoints = [...formData.impact_points];
        newPoints[index] = value;
        setFormData({ ...formData, impact_points: newPoints });
    };

    const addImpactPoint = () => {
        setFormData({ ...formData, impact_points: [...formData.impact_points, ''] });
    };

    const removeImpactPoint = (index) => {
        const newPoints = formData.impact_points.filter((_, i) => i !== index);
        setFormData({ ...formData, impact_points: newPoints });
    };

    const MAX_IMAGES = 6;
    const MAX_GALLERY_IMAGES = 3;
    const totalImages = existingImages.length + images.length;

    const handleGalleryToggle = (type, identifier) => {
        const currentSelections = gallerySelections[type];
        const isSelected = currentSelections.includes(identifier);
        const totalSelected = gallerySelections.existing.length + gallerySelections.new.length;

        if (!isSelected && totalSelected >= MAX_GALLERY_IMAGES) {
            alert(`You can select only up to ${MAX_GALLERY_IMAGES} images for gallery.`);
            return;
        }

        setGallerySelections(prev => ({
            ...prev,
            [type]: isSelected 
                ? currentSelections.filter(id => id !== identifier) 
                : [...currentSelections, identifier]
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (totalImages + files.length > MAX_IMAGES) {
            alert(`Maximum ${MAX_IMAGES} images allowed. You can only add ${MAX_IMAGES - totalImages} more.`);
            return;
        }
        setImages([...images, ...files]);
        
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...filePreviews]);
    };

    const removeExistingImage = (url) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            setExistingImages(existingImages.filter(img => img !== url));
            setDeletedImages([...deletedImages, url]);
            setGallerySelections(prev => ({
                ...prev,
                existing: prev.existing.filter(imgUrl => imgUrl !== url)
            }));
        }
    };

    const removeNewImage = (index) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            const newImages = [...images];
            const newPreviews = [...previewImages];
            newImages.splice(index, 1);
            newPreviews.splice(index, 1);
            setImages(newImages);
            setPreviewImages(newPreviews);
            
            setGallerySelections(prev => ({
                ...prev,
                new: prev.new.filter(i => i !== index).map(i => i > index ? i - 1 : i)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'impact_points') {
                formData[key].forEach(point => {
                    if (point.trim()) data.append('impact_points', point.trim());
                });
            } else {
                data.append(key, formData[key]);
            }
        });

        images.forEach(image => {
            data.append('images', image);
        });

        deletedImages.forEach(url => {
            data.append('deleted_images', url);
        });

        gallerySelections.existing.forEach(url => {
            data.append('gallery_urls', url);
        });

        gallerySelections.new.forEach(idx => {
            data.append('gallery_new_indices', idx);
        });

        try {
            if (isEdit) {
                const res = await api.put(`/projects/${project.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSave(res.data, 'update');
            } else {
                const res = await api.post('/projects/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) {
            console.error('Save failed', err);
            alert('Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                ></motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden relative z-10 mt-auto sm:mt-0"
                >
                    <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sm:p-6 flex justify-between items-center z-20 shrink-0">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isEdit ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-grow">
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
                                <input type="text" name="title" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.title} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select name="category" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.category} onChange={handleChange}>
                                    <option>Education</option>
                                    <option>Health</option>
                                    <option>Government Work</option>
                                    <option>Infrastructure</option>
                                    <option>Social</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                <input type="text" name="location" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.location} onChange={handleChange} placeholder="e.g. Pipaliya, Gujarat" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input type="text" name="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.date} onChange={handleChange} placeholder="e.g. June 2023" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description</label>
                            <textarea name="description" required rows="2" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.description} onChange={handleChange}></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Description</label>
                            <textarea name="full_description" required rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.full_description} onChange={handleChange}></textarea>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800">Key Impact Points</label>
                                    <p className="text-xs text-slate-500 mt-1">Add bullet points highlighting the project's impact.</p>
                                </div>
                                <button type="button" onClick={addImpactPoint} className="px-4 py-2 bg-white text-sm text-primary rounded-lg border border-primary/20 hover:bg-primary/5 flex items-center gap-2 font-bold transition-all shadow-sm">
                                    <Plus size={16} /> Add Point
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.impact_points.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No impact points added yet.</p>
                                )}
                                {formData.impact_points.map((point, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <textarea
                                            rows="2"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                                            value={point}
                                            onChange={(e) => handleImpactPointChange(idx, e.target.value)}
                                            placeholder="e.g. Empowered 50+ women with sewing skills"
                                        />
                                        <button type="button" onClick={() => removeImpactPoint(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0 mt-1">
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Project Images</label>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalImages >= MAX_IMAGES ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                    {totalImages} / {MAX_IMAGES} Images
                                </span>
                            </div>
                            
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                disabled={totalImages >= MAX_IMAGES}
                                className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                            />

                            {(existingImages.length > 0 || previewImages.length > 0) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {/* Existing Images */}
                                    {existingImages.map((src, idx) => {
                                        const isSelected = gallerySelections.existing.includes(src);
                                        return (
                                            <div key={`exist-${idx}`} className={`group flex flex-col relative rounded-xl overflow-hidden transition-all border-2 bg-white ${isSelected ? 'border-primary shadow-md shadow-green-200' : 'border-slate-200 shadow-sm'}`}>
                                                <div className="relative aspect-video overflow-hidden shrink-0">
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                            Gallery Image
                                                        </div>
                                                    )}
                                                    <img src={`${src}`} alt="Existing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={() => removeExistingImage(src)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-all shadow-lg transform hover:scale-110" title="Delete Image">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-center grow">
                                                    <label className="flex items-center gap-2 cursor-pointer w-full justify-center group/label">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => handleGalleryToggle('existing', src)}
                                                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs font-bold text-slate-700 group-hover/label:text-primary transition-colors">Show in Gallery</span>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* New Images */}
                                    {previewImages.map((src, idx) => {
                                        const isSelected = gallerySelections.new.includes(idx);
                                        return (
                                            <div key={`new-${idx}`} className={`group flex flex-col relative rounded-xl overflow-hidden transition-all border-2 bg-white ${isSelected ? 'border-primary shadow-md shadow-green-200' : 'border-slate-200 shadow-sm'}`}>
                                                <div className="relative aspect-video overflow-hidden shrink-0">
                                                    <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">NEW</div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                            Gallery Image
                                                        </div>
                                                    )}
                                                    <img src={src} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={() => removeNewImage(idx)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-all shadow-lg transform hover:scale-110" title="Delete Image">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-center grow">
                                                    <label className="flex items-center gap-2 cursor-pointer w-full justify-center group/label">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => handleGalleryToggle('new', idx)}
                                                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer transition-colors"
                                                        />
                                                        <span className="text-xs font-bold text-slate-700 group-hover/label:text-primary transition-colors">Show in Gallery</span>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                                <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all w-full sm:w-auto">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto">
                                    <Save size={20} /> {loading ? 'Saving...' : 'Save Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProjectModal;
