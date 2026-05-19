import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, ImageIcon, Briefcase, LogOut, Menu, X, MessageSquare, MapPin, Info } from 'lucide-react';
import LOGO from '../../assets/LOGO.png'; 
import ErrorBoundary from '../common/ErrorBoundary';
import api from '../../api/axios';

const AdminLayout = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/contact/unread/count');
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        
        const handleRefresh = () => fetchUnreadCount();
        window.addEventListener('refreshUnreadCount', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshUnreadCount', handleRefresh);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.warn("Logout request failed:", err);
        }
        localStorage.removeItem('adminInfo');
        navigate('/admin-vpm-portal');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <img src={LOGO} alt="Trust Logo" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-bold text-lg tracking-tight">Admin Panel</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white p-6 flex flex-col z-50 shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen md:sticky top-0 shrink-0`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <img src={LOGO} alt="Trust Logo" className="w-10 h-10 rounded-full object-cover shadow-lg shadow-green-500/20" />
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight leading-none">VPM</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Panel</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-3 flex-grow">
                    <Link onClick={() => setSidebarOpen(false)} to="/admin-vpm-portal/dashboard" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin-vpm-portal/dashboard') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Layout size={20} /> Dashboard
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin-vpm-portal/projects" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin-vpm-portal/projects') || location.pathname.includes('/admin-vpm-portal/projects') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Briefcase size={20} /> Projects
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin-vpm-portal/gallery" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin-vpm-portal/gallery') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <ImageIcon size={20} /> Gallery
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin-vpm-portal/locations" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin-vpm-portal/locations') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <MapPin size={20} /> Map Locations
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin-vpm-portal/about" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin-vpm-portal/about') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Info size={20} /> About & Identity
                    </Link>
                    <Link
                        onClick={() => setSidebarOpen(false)}
                        to="/admin-vpm-portal/contacts"
                        className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                            isActive('/admin-vpm-portal/contacts')
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare size={20} />
                            <span>Messages</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 p-3.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full text-left mt-10 font-bold min-h-[44px]">
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow p-4 sm:p-6 md:p-10 w-full overflow-x-hidden min-w-0">
                {title && (
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                    </div>
                )}
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default AdminLayout;
