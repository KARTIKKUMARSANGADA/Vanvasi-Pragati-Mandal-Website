import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Image as ImageIcon, Briefcase, ArrowRight, Mail, Calendar, TrendingUp, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabase';

const Dashboard = () => {
    const [stats, setStats] = useState({ projects: 0, images: 0, messages: 0 });
    const [projects, setProjects] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes] = await Promise.all([
                api.get('/stats/'),
                api.get('/activity/')
            ]);
            
            const statsData = statsRes.data;
            const activityData = activityRes.data || [];
            
            setStats({
                projects: statsData.projects || 0,
                images: statsData.images || 0,
                messages: statsData.messages || 0
            });
            setProjects((statsData.recent_projects || []).slice(0, 5));
            setMessages((statsData.recent_messages || []).slice(0, 5));
            setChartData(statsData.chart_data || []);
            setActivities(activityData.slice(0, 5));
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Subscribe to real-time database changes to refresh dashboard instantly
        const channel = supabase
            .channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchDashboardData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchDashboardData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchDashboardData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Just now';
        const diff = new Date() - new Date(dateString);
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <AdminLayout title="Dashboard">
            {loading ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Top Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <Link to="/admin-vpm-portal/projects" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all flex-1 sm:flex-none">
                            <Briefcase size={18} /> Manage Projects
                        </Link>
                        <Link to="/admin-vpm-portal/gallery" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all flex-1 sm:flex-none">
                            <ImageIcon size={18} /> Upload Image
                        </Link>
                        <Link to="/admin-vpm-portal/contacts" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all flex-1 sm:flex-none">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Columns: Projects and Messages stacked */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Projects Table */}
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
                                    <Link to="/admin-vpm-portal/projects" className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all">
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
                                                        <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-primary transition-colors max-w-[200px] break-words whitespace-normal font-sans">
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
                                    <Link to="/admin-vpm-portal/contacts" className="flex items-center gap-1 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-4 py-2 rounded-lg transition-all">
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

                        {/* Right Column: Recent Activity Log Timeline */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                                        <p className="text-xs text-slate-500 font-medium">Real-time log of updates</p>
                                    </div>
                                </div>
                                
                                <div className="relative border-l border-slate-100 pl-6 ml-4 space-y-8 grow py-2">
                                    {activities.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No recent actions logged.</p>
                                    ) : (
                                        activities.map((act) => (
                                            <div key={act.uuid || act.id} className="relative">
                                                {/* Timeline dot */}
                                                <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-slate-50">
                                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                </span>
                                                <div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="inline-block px-2.5 py-1 text-xs font-black bg-slate-100 text-slate-700 rounded-lg uppercase tracking-wider">
                                                            {act.action}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold shrink-0">
                                                            {formatRelativeTime(act.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                                                        {act.details}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default Dashboard;
