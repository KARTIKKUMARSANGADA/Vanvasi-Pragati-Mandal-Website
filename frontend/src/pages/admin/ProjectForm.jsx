import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

const ProjectForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    
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
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchProject = async () => {
                try {
                    const { data } = await api.get(`/projects/${id}`);
                    setFormData({
                        title: data.title,
                        category: data.category,
                        description: data.description,
                        full_description: data.full_description,
                        location: data.location,
                        date: data.date,
                        impact_points: data.impact_points || [],
                    });
                    setPreviewImages(data.images.map(img => `${img.image_url}`));
                } catch (err) {
                    console.error('Failed to fetch project', err);
                    alert('Project not found');
                    navigate('/admin/dashboard');
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchProject();
        }
    }, [id, isEdit, navigate]);

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);
        
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...filePreviews]);
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

        try {
            console.log('Submitting Project Data:', Object.fromEntries(data.entries()));
            let response;
            if (isEdit) {
                response = await api.put(`/projects/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/projects/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            console.log('Save response:', response.data);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Save failed. Error details:', JSON.stringify(err.response?.data || err.message));
            if (err.response?.status === 422) {
                alert(`Validation Error: ${JSON.stringify(err.response.data.detail)}`);
            } else {
                alert('Failed to save project. Check console for details.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8">Loading project details...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all mb-6 font-medium">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Project' : 'Add New Project'}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option>Education</option>
                                    <option>Health</option>
                                    <option>Government Work</option>
                                    <option>Infrastructure</option>
                                    <option>Social</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Pipaliya, Gujarat"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                                <input
                                    type="text"
                                    name="date"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.date}
                                    onChange={handleChange}
                                    placeholder="e.g. June 2023"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description</label>
                            <textarea
                                name="description"
                                required
                                rows="2"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Description</label>
                            <textarea
                                name="full_description"
                                required
                                rows="6"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.full_description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Impact Points</label>
                                <button type="button" onClick={addImpactPoint} className="text-sm text-primary flex items-center gap-1 font-semibold">
                                    <Plus size={16} /> Add More
                                </button>
                            </div>
                            {formData.impact_points.map((point, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={point}
                                        onChange={(e) => handleImpactPointChange(idx, e.target.value)}
                                        placeholder="e.g. Women empowerment"
                                    />
                                    <button type="button" onClick={() => removeImpactPoint(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Project Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previewImages.map((src, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> {loading ? 'Saving...' : 'Save Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProjectForm;
