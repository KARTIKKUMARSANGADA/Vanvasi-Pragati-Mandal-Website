import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Image as ImageIcon, Briefcase, ArrowRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const Dashboard = () => {
    const [stats, setStats] = useState({ projects: 0, images: 0 });
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projRes, galleryRes] = await Promise.all([
                    api.get('/projects/'),
                    api.get('/gallery/')
                ]);
                console.log('Dashboard Projects:', projRes.data);
                console.log('Dashboard Gallery:', galleryRes.data);
                
                const projectsData = Array.isArray(projRes.data) ? projRes.data : [];
                const galleryData = Array.isArray(galleryRes.data) ? galleryRes.data : [];

                setProjects(projectsData.slice(0, 5)); 
                setStats({
                    projects: projectsData.length,
                    images: galleryData.length
                });
            } catch (err) {
                console.error('Failed to fetch dashboard data. Details:', JSON.stringify(err.response?.data || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <AdminLayout title="Dashboard">
            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link to="/admin/projects" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all flex-1 sm:flex-none">
                    <Briefcase size={18} /> Manage Projects
                </Link>
                <Link to="/admin/gallery" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all flex-1 sm:flex-none">
                    <ImageIcon size={18} /> Upload Image
                </Link>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/50 border border-slate-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Briefcase size={28} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Total Projects</h3>
                            <p className="text-4xl font-extrabold text-slate-900">{stats.projects}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <ImageIcon size={28} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Gallery Images</h3>
                            <p className="text-4xl font-extrabold text-slate-900">{stats.images}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
                    <Link to="/admin/projects" className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading recent projects...</div>
                    ) : (
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-center">Category</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 italic">No projects added yet.</td>
                                    </tr>
                                ) : (
                                    projects.map(project => (
                                        <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                                            <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                {String(project.title || 'Untitled')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-green-50 text-primary text-xs font-bold rounded-full">{String(project.category || 'N/A')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium text-right">{String(project.date || 'N/A')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
