import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, ImageIcon, Briefcase, LogOut, Menu, X, MessageSquare } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">V</div>
                    <span className="font-bold text-xl tracking-tight">VPM Admin</span>
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
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-green-500/30">V</div>
                        <span className="font-bold text-xl tracking-tight">VPM Admin</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-3 flex-grow">
                    <Link onClick={() => setSidebarOpen(false)} to="/admin/dashboard" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/dashboard') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Layout size={20} /> Dashboard
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin/projects" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/projects') || location.pathname.includes('/admin/projects') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Briefcase size={20} /> Projects
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin/gallery" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/gallery') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <ImageIcon size={20} /> Gallery
                    </Link>
                    <Link onClick={() => setSidebarOpen(false)} to="/admin/contacts" className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/contacts') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <MessageSquare size={20} /> Messages
                    </Link>
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 p-3.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full text-left mt-10 font-bold min-h-[44px]">
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow p-4 sm:p-6 md:p-8 w-full max-w-[100vw] overflow-hidden">
                {title && (
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
