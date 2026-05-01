import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Plus, Trash2, Edit2, Briefcase, AlertTriangle, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProjectModal from '../../components/admin/ProjectModal';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [projectToDelete, setProjectToDelete] = useState(null);
    const [deleteGalleryImages, setDeleteGalleryImages] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects/');
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (project) => {
        setProjectToDelete(project);
        setDeleteGalleryImages(false);
    };

    const closeDeleteModal = () => {
        setProjectToDelete(null);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/projects/${projectToDelete.id}?delete_gallery_images=${deleteGalleryImages}`);
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            
            // Show toast message
            const toast = document.createElement('div');
            toast.className = 'fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl bg-slate-900 text-white font-bold transition-all';
            toast.innerText = 'Project deleted successfully';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
            
            closeDeleteModal();
        } catch (err) {
            alert('Failed to delete project');
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleSave = (savedProject, type) => {
        if (type === 'create') {
            setProjects([...projects, savedProject]);
        } else {
            setProjects(projects.map(p => p.id === savedProject.id ? savedProject : p));
        }
    };

    return (
        <AdminLayout title="Projects Management">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">All Projects</h2>
                        <p className="text-sm text-slate-500">Manage, add or edit your NGO projects here</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all">
                    <Plus size={18} /> Add Project
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-slate-500">Loading projects...</div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                                <tr>
                                    <th className="px-4 sm:px-6 py-5 font-semibold">Project Title</th>
                                    <th className="px-4 sm:px-6 py-5 font-semibold text-center">Category</th>
                                    <th className="px-4 sm:px-6 py-5 font-semibold text-right">Date</th>
                                    <th className="px-4 sm:px-6 py-5 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No projects found. Create one!</td>
                                    </tr>
                                )}
                                {projects.map(project => (
                                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 font-bold text-slate-900">{project.title}</td>
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-50 text-primary text-xs font-bold rounded-full">{project.category}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-500 font-medium text-right">{project.date}</td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(project)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Project">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => openDeleteModal(project)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Project">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                project={editingProject} 
                onSave={handleSave} 
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {projectToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={closeDeleteModal} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Delete Project?</h2>
                                <p className="text-slate-600 text-center mb-6">Are you sure you want to delete <span className="font-bold text-slate-900">"{projectToDelete.title}"</span>?</p>
                                
                                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-bold text-red-600 flex items-center justify-center gap-2 mb-2">
                                        ⚠️ This action cannot be undone.
                                    </p>
                                    <p className="text-xs text-center text-red-400">
                                        This project has {projectToDelete.images?.length || 0} image(s).
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input 
                                                type="checkbox" 
                                                checked={deleteGalleryImages}
                                                onChange={(e) => setDeleteGalleryImages(e.target.checked)}
                                                className="w-5 h-5 text-red-500 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-800">Also delete associated images from Gallery</p>
                                            <p className="text-slate-500 mt-1">If unchecked, the project's images will still remain visible in the public gallery.</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={closeDeleteModal} 
                                        disabled={isDeleting}
                                        className="flex-1 px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDelete} 
                                        disabled={isDeleting}
                                        className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <Trash2 size={18} /> {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminProjects;
