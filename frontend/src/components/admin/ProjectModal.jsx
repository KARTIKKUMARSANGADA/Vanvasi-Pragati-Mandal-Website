import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const appendScalarField = (formData, key, value) => {
    if (value === null || value === undefined) return;

    if (key.startsWith('is_') || key.startsWith('has_') || key.startsWith('show_')) {
        const boolValue = Array.isArray(value) ? false : !!value;
        formData.append(key, String(boolValue));
        return;
    }

    if (Array.isArray(value)) {
        return;
    }

    if (typeof value === 'boolean') {
        formData.append(key, String(value));
        return;
    }

    const normalizedValue = typeof value === 'string' ? value.trim() : value;
    if (normalizedValue === '' || normalizedValue === '[]') return;

    formData.append(key, normalizedValue);
};

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
    const [mainImageSelection, setMainImageSelection] = useState({ type: null, identifier: null });

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
                setExistingImages(project.images || []);
                const existingMain = project.images ? project.images.find(img => img.is_main) : null;
                setMainImageSelection({
                    type: existingMain ? 'existing' : null,
                    identifier: existingMain ? (existingMain.uuid || existingMain.image_url) : null
                });
            } else {
                setFormData({
                    title: '',
                    category: '',
                    description: '',
                    full_description: '',
                    location: '',
                    date: '',
                    impact_points: [],
                });
                setExistingImages([]);
                setGallerySelections({ existing: [], new: [] });
                setMainImageSelection({ type: null, identifier: null });
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

    const handleMainImageToggle = (type, identifier) => {
        setMainImageSelection({ type, identifier });
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

    const removeExistingImage = (img) => {
        const identifier = img.uuid || img.image_url;
        if (window.confirm('Are you sure you want to delete this image?')) {
            setExistingImages(existingImages.filter(i => (i.uuid || i.image_url) !== identifier));
            setDeletedImages([...deletedImages, img.image_url]);
            setGallerySelections(prev => ({
                ...prev,
                existing: prev.existing.filter(id => id !== identifier)
            }));
            if (mainImageSelection.identifier === identifier) {
                setMainImageSelection({ type: null, identifier: null });
            }
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

            if (mainImageSelection.type === 'new') {
                if (mainImageSelection.identifier === index) {
                    setMainImageSelection({ type: null, identifier: null });
                } else if (mainImageSelection.identifier > index) {
                    setMainImageSelection(prev => ({ ...prev, identifier: prev.identifier - 1 }));
                }
            }
        }
    };

    const moveExistingImage = (index, direction) => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === existingImages.length - 1) return;
        
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        const newImages = [...existingImages];
        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;
        setExistingImages(newImages);
    };

    const movePreviewImage = (index, direction) => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === previewImages.length - 1) return;
        
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        
        const newImages = [...images];
        const tempImg = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = tempImg;
        setImages(newImages);
        
        const newPreviews = [...previewImages];
        const tempPrev = newPreviews[index];
        newPreviews[index] = newPreviews[targetIndex];
        newPreviews[targetIndex] = tempPrev;
        setPreviewImages(newPreviews);
        
        setGallerySelections(prev => {
            const currentNew = [...prev.new];
            const hasIndex = currentNew.includes(index);
            const hasTarget = currentNew.includes(targetIndex);
            
            let updated = currentNew;
            if (hasIndex && !hasTarget) {
                updated = currentNew.map(i => i === index ? targetIndex : i);
            } else if (!hasIndex && hasTarget) {
                updated = currentNew.map(i => i === targetIndex ? index : i);
            }
            return { ...prev, new: updated };
        });

        if (mainImageSelection.type === 'new') {
            if (mainImageSelection.identifier === index) {
                setMainImageSelection(prev => ({ ...prev, identifier: targetIndex }));
            } else if (mainImageSelection.identifier === targetIndex) {
                setMainImageSelection(prev => ({ ...prev, identifier: index }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'impact_points') {
                value.forEach(point => {
                    if (point.trim()) data.append('impact_points', point.trim());
                });
                return;
            }
            appendScalarField(data, key, value);
        });

        images.forEach(image => data.append('images', image));
        deletedImages.forEach(url => data.append('deleted_images', url));
        gallerySelections.existing.forEach(url => data.append('gallery_urls', url));
        gallerySelections.new.forEach(idx => data.append('gallery_new_indices', idx));

        const orderedUrls = existingImages.map(image => typeof image === 'string' ? image : image.image_url);
        orderedUrls.forEach(url => data.append('ordered_image_urls', url));

        if (mainImageSelection.type === 'existing' && mainImageSelection.identifier) {
            data.append('main_image_url', mainImageSelection.identifier);
        } else if (mainImageSelection.type === 'new' && typeof mainImageSelection.identifier === 'number') {
            data.append('main_image_index', mainImageSelection.identifier);
        }

        try {
            if (isEdit) {
                const res = await api.put(`/projects/${project.uuid}`, data, {
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
            const errorData = err.response?.data;
            if (err.response?.status === 422) {
                const details = errorData?.detail;
                const errorMsg = Array.isArray(details)
                    ? details.map(d => `${d.loc.join('.')}: ${d.msg}`).join('\n')
                    : JSON.stringify(details);
                alert(`Validation Error:\n${errorMsg}`);
            } else {
                alert(err.message || 'Failed to save project');
            }
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
                                    <input type="text" name="category" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={formData.category} onChange={handleChange} placeholder="e.g. Health, Education" />
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
                                        {existingImages.map((image, idx) => {
                                            const src = typeof image === 'string' ? image : image.image_url;
                                            const isSelected = gallerySelections.existing.includes(src);
                                            const isMain = mainImageSelection.type === 'existing' && mainImageSelection.identifier === src;
                                            return (
                                                <div key={image.uuid || image.id || idx} className={`group flex flex-col relative rounded-xl overflow-hidden transition-all border-2 bg-white ${isMain ? 'border-amber-400 ring-2 ring-amber-100 shadow-lg shadow-amber-200/40' : isSelected ? 'border-primary shadow-md shadow-green-200' : 'border-slate-200 shadow-sm'}`}>
                                                    <div className="relative aspect-video overflow-hidden shrink-0">
                                                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                                            {isMain && <div className="bg-amber-400 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm uppercase tracking-tight">Main Image</div>}
                                                            {isSelected && <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-tight">Gallery</div>}
                                                        </div>
                                                        <img src={`${src}`} alt="Existing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {idx > 0 && (
                                                                <button type="button" onClick={() => moveExistingImage(idx, 'left')} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-50 transition-all shadow-lg transform hover:scale-110" title="Move Left">
                                                                    <ArrowLeft size={18} />
                                                                </button>
                                                            )}
                                                            <button type="button" onClick={() => handleMainImageToggle('existing', src)} className={`p-2 rounded-full transition-all shadow-lg transform hover:scale-110 ${isMain ? 'bg-amber-400 text-white' : 'bg-white text-amber-500 hover:bg-amber-50'}`} title="Set as Main Image">
                                                                <Save size={18} />
                                                            </button>
                                                            <button type="button" onClick={() => removeExistingImage(src)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-all shadow-lg transform hover:scale-110" title="Delete Image">
                                                                <Trash2 size={18} />
                                                            </button>
                                                            {idx < existingImages.length - 1 && (
                                                                <button type="button" onClick={() => moveExistingImage(idx, 'right')} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-50 transition-all shadow-lg transform hover:scale-110" title="Move Right">
                                                                    <ArrowRight size={18} />
                                                                </button>
                                                            )}
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

                                        {previewImages.map((src, idx) => {
                                            const isSelected = gallerySelections.new.includes(idx);
                                            const isMain = mainImageSelection.type === 'new' && mainImageSelection.identifier === idx;
                                            return (
                                                <div key={`new-${idx}`} className={`group flex flex-col relative rounded-xl overflow-hidden transition-all border-2 bg-white ${isMain ? 'border-amber-400 ring-2 ring-amber-100 shadow-lg shadow-amber-200/40' : isSelected ? 'border-primary shadow-md shadow-green-200' : 'border-slate-200 shadow-sm'}`}>
                                                    <div className="relative aspect-video overflow-hidden shrink-0">
                                                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                                            <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-tight w-fit">NEW</div>
                                                            {isMain && <div className="bg-amber-400 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm uppercase tracking-tight w-fit">Main Image</div>}
                                                            {isSelected && <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-tight w-fit">Gallery</div>}
                                                        </div>
                                                        <img src={src} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {idx > 0 && (
                                                                <button type="button" onClick={() => movePreviewImage(idx, 'left')} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-50 transition-all shadow-lg transform hover:scale-110" title="Move Left">
                                                                    <ArrowLeft size={18} />
                                                                </button>
                                                            )}
                                                            <button type="button" onClick={() => handleMainImageToggle('new', idx)} className={`p-2 rounded-full transition-all shadow-lg transform hover:scale-110 ${isMain ? 'bg-amber-400 text-white' : 'bg-white text-amber-500 hover:bg-amber-50'}`} title="Set as Main Image">
                                                                <Save size={18} />
                                                            </button>
                                                            <button type="button" onClick={() => removeNewImage(idx)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-all shadow-lg transform hover:scale-110" title="Delete Image">
                                                                <Trash2 size={18} />
                                                            </button>
                                                            {idx < previewImages.length - 1 && (
                                                                <button type="button" onClick={() => movePreviewImage(idx, 'right')} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-50 transition-all shadow-lg transform hover:scale-110" title="Move Right">
                                                                    <ArrowRight size={18} />
                                                                </button>
                                                            )}
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
