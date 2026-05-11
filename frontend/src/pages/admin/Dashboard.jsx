import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Plus, Image as ImageIcon, Briefcase, ArrowRight, Mail, Calendar, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ projects: 0, images: 0, messages: 0 });
    const [projects, setProjects] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projRes, galleryRes, contactRes] = await Promise.all([
                    supabase.from('projects').select('*').order('created_at', { ascending: false }),
                    supabase.from('gallery').select('*'),
                    supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
                ]);
                
                const projectsData = projRes.data || [];
                const galleryData = galleryRes.data || [];
                const messagesData = contactRes.data || [];

                setProjects(projectsData.slice(0, 5)); 
                setMessages(messagesData.slice(0, 5));
                setStats({
                    projects: projectsData.length,
                    images: galleryData.length,
                    messages: messagesData.length
                });

                // Process chart data (messages per day for last 7 days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const counts = last7Days.map(date => {
                    const count = messagesData.filter(m => m.created_at?.startsWith(date)).length;
                    return {
                        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        messages: count
                    };
                });
                setChartData(counts);

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
                <Link to="/admin/contacts" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all flex-1 sm:flex-none">
                    <Mail size={18} /> View Messages
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Projects</h3>
                        <p className="text-4xl font-extrabold text-slate-900">{stats.projects}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ImageIcon size={28} />
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Images</h3>
                        <p className="text-4xl font-extrabold text-slate-900">{stats.images}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Messages</h3>
                        <p className="text-4xl font-extrabold text-slate-900">{stats.messages}</p>
                    </div>
                </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Message Trends</h2>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="messages" 
                                stroke="#4f46e5" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorMsg)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Projects Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
                        <Link to="/admin/projects" className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-12 text-center text-slate-500 italic">No projects added.</td>
                                    </tr>
                                ) : (
                                    projects.map(project => (
                                        <tr key={project.uuid || project.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                                            <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-primary transition-colors max-w-[200px] break-words whitespace-normal">
                                                {String(project.title || 'Untitled')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium text-right">{String(project.date || 'N/A')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Messages Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-bold text-slate-900">Recent Messages</h2>
                        <Link to="/admin/contacts" className="flex items-center gap-1 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-4 py-2 rounded-lg transition-all">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">From</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {messages.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-12 text-center text-slate-500 italic">No messages found.</td>
                                    </tr>
                                ) : (
                                    messages.map(msg => (
                                        <tr key={msg.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                                            <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-orange-600 transition-colors whitespace-normal">
                                                {String(msg.name || 'Anonymous')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-medium text-right">
                                                {formatDate(msg.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
