import { useState, useEffect } from 'react';
import { Mail, Trash2, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, BookOpen, Users, Layout, Download, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const AdminSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'broadcast' | 'project-bulletin'

    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(25);
    const [hasMore, setHasMore] = useState(true);

    // Form states
    const [subject, setSubject] = useState('');
    const [bodyContent, setBodyContent] = useState('');
    const [ctaText, setCtaText] = useState('Read More');
    const [ctaLink, setCtaLink] = useState('https://vanvasi-pragati-mandal-pipaliya.vercel.app');
    const [sending, setSending] = useState(false);
    
    // Project bulletin state
    const [selectedProjectUuid, setSelectedProjectUuid] = useState('');
    const [bulletinSending, setBulletinSending] = useState(false);

    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        onConfirm: () => {}
    });

    const triggerConfirm = ({ title, message, confirmText, cancelText, onConfirm }) => {
        setConfirmModal({
            isOpen: true,
            title: title || 'Are you sure?',
            message: message || '',
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel',
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const fetchSubscribers = async (currentSkip = skip) => {
        try {
            const subsRes = await api.get(`/subscribers/?skip=${currentSkip}&limit=${limit}`);
            const data = subsRes.data || [];
            setSubscribers(data);
            if (data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (err) {
            console.error("Failed to load subscriber list:", err);
            setError("Could not load subscriber listings.");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const projRes = await api.get('/projects/');
            setProjects(projRes.data || []);
            await fetchSubscribers(skip);
        } catch (err) {
            console.error("Failed to load subscriber center data:", err);
            setError("Could not load subscriber listings or active projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = async (newSkip) => {
        setSkip(newSkip);
        setLoading(true);
        await fetchSubscribers(newSkip);
        setLoading(false);
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
            setError("No subscribers to export.");
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        // Header columns
        const headers = ["Email", "Joined Date"];
        
        // Compile rows
        const csvRows = [
            headers.join(","), // Header row
            ...subscribers.map(sub => [
                `"${String(sub.email || '').replace(/"/g, '""')}"`,
                `"${new Date(sub.created_at).toLocaleString()}"`
            ].join(","))
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VPM_Active_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUnsubscribe = (email) => {
        triggerConfirm({
            title: "Remove Subscriber",
            message: `Are you sure you want to remove ${email} from active subscribers?`,
            confirmText: "Unsubscribe",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    setError(null);
                    await api.delete(`/subscribers/${email}`);
                    await fetchSubscribers(skip);
                    showSuccess(`Successfully unsubscribed ${email}`);
                } catch (err) {
                    console.error("Failed to unsubscribe:", err);
                    setError("Could not unsubscribe user. Please try again.");
                }
            }
        });
    };


    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !bodyContent.trim()) {
            setError("Subject and newsletter content are required.");
            return;
        }

        setSending(true);
        setError(null);
        setSuccessMessage(null);

        // Build fully-styled professional HTML body
        const styledBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 40px 20px; width: 100%; box-sizing: border-box; margin: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); width: 100%; box-sizing: border-box;">
                    <!-- Branded Header -->
                    <div style="background-color: #1b4332; padding: 32px 24px; text-align: center;">
                        <img src="https://vanvasi-pragati-mandal-pipaliya.vercel.app/LOGO.png" alt="Vanvasi Pragati Mandal Logo" width="56" height="56" style="display: block; margin: 0 auto 12px auto; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.3); background-color: #ffffff;" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
                            Vanvasi Pragati Mandal
                        </h1>
                        <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                            Pipaliya &bull; Dahod &bull; Gujarat
                        </p>
                    </div>
                    
                    <!-- Content area -->
                    <div style="padding: 36px 40px; background-color: #ffffff; box-sizing: border-box;">
                        <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.8px;">📢 Announcement</div>
                        <h3 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; line-height: 1.4;">${subject}</h3>
                        <div style="color: #334155; font-size: 16px; line-height: 1.8; margin-bottom: 30px; white-space: pre-line;">${bodyContent}</div>
                        
                        ${ctaText && ctaLink ? `
                        <div style="text-align: center; margin-top: 35px;">
                            <a href="${ctaLink}" style="background-color: #15803d; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.2); transition: all 0.3s ease;">
                                ${ctaText}
                            </a>
                        </div>` : ''}
                    </div>

                    <!-- Footer matching _footer_html -->
                    <div style="background-color: #ffffff; padding: 16px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                        <div style="font-size: 12px; color: #475569; margin-bottom: 8px; font-weight: 500; font-family: sans-serif;">
                            <span style="display: inline-block; margin: 2px 6px;">📞 +91 81402 55951</span>
                            <span style="color: #cbd5e1; margin: 0 8px; display: inline-block;">|</span>
                            <span style="display: inline-block; margin: 2px 6px;">✉️ official.vanvasipragatimandal@gmail.com</span>
                        </div>
                        <div style="margin-bottom: 8px; text-align: center;">
                            <a href="https://facebook.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="16" height="16" alt="Facebook" style="display: block; border-radius: 50%;" />
                            </a>
                            <a href="https://twitter.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/3256/3256013.png" width="16" height="16" alt="Twitter" style="display: block; border-radius: 50%;" />
                            </a>
                            <a href="https://instagram.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="16" height="16" alt="Instagram" style="display: block; border-radius: 50%;" />
                            </a>
                            <a href="https://linkedin.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="16" height="16" alt="LinkedIn" style="display: block; border-radius: 50%;" />
                            </a>
                            <a href="https://wa.me/918140255951" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536445.png" width="16" height="16" alt="WhatsApp" style="display: block; border-radius: 50%;" />
                            </a>
                        </div>
                        <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 500; letter-spacing: 0.3px;">
                            &copy; ${new Date().getFullYear()} Vanvasi Pragati Mandal. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;

        try {
            await api.post('/subscribers/broadcast', {
                subject,
                body: styledBody
            });
            showSuccess("Custom newsletter broadcast queued successfully!");
            setSubject('');
            setBodyContent('');
        } catch (err) {
            console.error("Failed to send broadcast:", err);
            setError("Could not launch campaign. Ensure your backend mailer configuration is setup.");
        } finally {
            setSending(false);
        }
    };

    const handleSendProjectBulletin = async (e) => {
        e.preventDefault();
        if (!selectedProjectUuid) {
            setError("Please select a project bulletin campaign to dispatch.");
            return;
        }

        setBulletinSending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await api.post('/subscribers/notify', {
                project_uuid: selectedProjectUuid
            });
            showSuccess("Project bulletin broadcast dispatched successfully!");
            setSelectedProjectUuid('');
        } catch (err) {
            console.error("Failed to dispatch project notification:", err);
            setError("Bulletin campaign dispatch failed. Ensure SMTP credentials are active.");
        } finally {
            setBulletinSending(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <AdminLayout title="Newsletter & Subscriber Broadcast Center">
            <div className="space-y-8">
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-primary flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-slate-900">{subscribers.length}</div>
                            <div className="text-slate-500 font-semibold text-sm">Active Subscribers</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-slate-900">{projects.length}</div>
                            <div className="text-slate-500 font-semibold text-sm">Live Case Studies</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Layout size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-slate-900">100%</div>
                            <div className="text-slate-500 font-semibold text-sm">Delivery Assurance</div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-center gap-3 font-semibold text-sm">
                        <AlertCircle className="text-red-600 shrink-0" size={20} />
                        <div>{error}</div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-xl flex items-center gap-3 font-semibold text-sm">
                        <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                        <div>{successMessage}</div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`pb-4 px-6 font-bold text-sm sm:text-base border-b-2 transition-all ${
                            activeTab === 'directory' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Subscriber Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('broadcast')}
                        className={`pb-4 px-6 font-bold text-sm sm:text-base border-b-2 transition-all ${
                            activeTab === 'broadcast' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Custom Broadcast Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('project-bulletin')}
                        className={`pb-4 px-6 font-bold text-sm sm:text-base border-b-2 transition-all ${
                            activeTab === 'project-bulletin' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Project Announcements
                    </button>
                </div>

                {/* Dynamic panels */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-slate-500 font-semibold">Synchronizing with subscriber register...</p>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'directory' && (
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="font-extrabold text-lg text-slate-900">Active Contacts</h3>
                                        <p className="text-sm text-slate-500 font-medium">Verify or clean subscription registry</p>
                                    </div>
                                    <button
                                        onClick={handleExportCSV}
                                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs"
                                        title="Export subscriber directory to CSV"
                                    >
                                        <Download size={14} />
                                        Export Directory
                                    </button>
                                </div>
                                
                                {subscribers.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <Mail size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-bold text-slate-500">No active subscribers registered yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                    <th className="py-4 px-6">Email Address</th>
                                                    <th className="py-4 px-6">Subscription Date</th>
                                                    <th className="py-4 px-6 text-center">Status</th>
                                                    <th className="py-4 px-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-semibold text-sm text-slate-700">
                                                {subscribers.map((sub, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-4 px-6 font-bold text-slate-900">{sub.email}</td>
                                                        <td className="py-4 px-6 text-slate-500">
                                                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            }) : 'Active'}
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-bold uppercase tracking-widest">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => handleUnsubscribe(sub.email)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Unsubscribe Contact"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {/* Pagination Controls */}
                                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <span className="text-sm font-bold text-slate-500">
                                                Showing {subscribers.length > 0 ? skip + 1 : 0} to {skip + subscribers.length} subscribers
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={skip === 0}
                                                    onClick={() => handlePageChange(skip - limit)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-xs cursor-pointer active:scale-95"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    disabled={!hasMore}
                                                    onClick={() => handlePageChange(skip + limit)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-xs cursor-pointer active:scale-95"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'broadcast' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Editor Form */}
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                    <div>
                                        <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                            <Sparkles size={20} className="text-green-500" />
                                            Campaign Composer
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">Draft a custom newsletter broadcast</p>
                                    </div>

                                    <form onSubmit={handleSendBroadcast} className="space-y-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Subject Line</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="VPM Project Spotlight: High-Impact Infrastructure Projects"
                                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Newsletter Content</label>
                                            <textarea
                                                rows={8}
                                                value={bodyContent}
                                                onChange={(e) => setBodyContent(e.target.value)}
                                                placeholder="Write your email body copy here. Styled paragraphs are separated by newlines..."
                                                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800 resize-none"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">CTA Button Text</label>
                                                <input
                                                    type="text"
                                                    value={ctaText}
                                                    onChange={(e) => setCtaText(e.target.value)}
                                                    placeholder="Read More"
                                                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">CTA Link URL</label>
                                                <input
                                                    type="url"
                                                    value={ctaLink}
                                                    onChange={(e) => setCtaLink(e.target.value)}
                                                    placeholder="https://..."
                                                    className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="w-full py-4 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-hover shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            {sending ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Queueing Campaign...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Broadcast Newsletter
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Campaign Preview */}
                                <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200/50 flex flex-col justify-start space-y-4">
                                    <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Live E-Mail Preview</div>
                                                               <div className="w-full max-w-full overflow-hidden flex-grow flex flex-col bg-white rounded-2xl shadow-lg border border-slate-100">
                                        {/* Branded Header */}
                                        <div className="p-8 text-center" style={{ backgroundColor: '#1b4332' }}>
                                            <img 
                                                src="https://vanvasi-pragati-mandal-pipaliya.vercel.app/LOGO.png" 
                                                alt="Vanvasi Pragati Mandal Logo" 
                                                className="w-14 h-14 mx-auto mb-3 rounded-full object-cover border-2 border-white/30 bg-white" 
                                            />
                                            <h1 className="text-white text-xl font-bold tracking-wide">
                                                Vanvasi Pragati Mandal
                                            </h1>
                                            <p className="text-emerald-200 text-[10px] font-bold tracking-widest uppercase mt-1">
                                                Pipaliya &bull; Dahod &bull; Gujarat
                                            </p>
                                        </div>
                                        
                                        {/* Content body */}
                                        <div className="p-8 space-y-6">
                                            <div className="inline-block bg-sky-100 text-sky-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                📢 Announcement
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <h3 className="text-slate-950 font-extrabold text-lg leading-tight">
                                                    {subject || "VPM Project Spotlight: High-Impact Infrastructure Projects"}
                                                </h3>
                                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {bodyContent || "Write your email copy in the editor to see the generated live design update dynamically."}
                                                </p>
                                            </div>

                                            {ctaText && (
                                                <div className="text-center pt-4">
                                                    <button
                                                        type="button"
                                                        className="px-8 py-3 text-white text-sm font-extrabold rounded-md shadow-md cursor-default"
                                                        style={{ backgroundColor: '#15803d' }}
                                                    >
                                                        {ctaText}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Branded Footer */}
                                        <div className="border-t border-slate-100 p-6 text-center bg-white space-y-3">
                                            <div className="text-[10px] text-slate-500 font-bold flex flex-wrap justify-center gap-x-3 gap-y-1">
                                                <span>📞 +91 81402 55951</span>
                                                <span className="text-slate-200">|</span>
                                                <span>✉️ official.vanvasipragatimandal@gmail.com</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
                                                &copy; {new Date().getFullYear()} Vanvasi Pragati Mandal. All rights reserved.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'project-bulletin' && (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl space-y-6">
                                <div>
                                    <h3 className="font-extrabold text-lg text-slate-900">Project Bulletin Campaigns</h3>
                                    <p className="text-sm text-slate-500 font-medium">Broadcast an automated portfolio showcase to all active members</p>
                                </div>

                                <form onSubmit={handleSendProjectBulletin} className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Select Project Bulletin</label>
                                        <select
                                            value={selectedProjectUuid}
                                            onChange={(e) => setSelectedProjectUuid(e.target.value)}
                                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary font-bold text-slate-800"
                                            required
                                        >
                                            <option value="">-- Choose a Case Study --</option>
                                            {projects.map((proj, idx) => (
                                                <option key={idx} value={proj.uuid}>
                                                    [{proj.category}] {proj.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedProjectUuid && (() => {
                                        const selectedProject = projects.find(p => p.uuid === selectedProjectUuid);
                                        if (!selectedProject) return null;
                                        return (
                                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                                                {selectedProject.images && selectedProject.images.length > 0 && (
                                                    <img 
                                                        src={selectedProject.images.find(img => img.is_main)?.image_url || selectedProject.images[0].image_url} 
                                                        alt={selectedProject.title} 
                                                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 shrink-0" 
                                                    />
                                                )}
                                                <div className="flex flex-col justify-center">
                                                    <span className="px-2 py-0.5 bg-green-50 text-primary text-[10px] rounded-full font-bold uppercase tracking-widest w-fit mb-1">
                                                        {selectedProject.category}
                                                    </span>
                                                    <h4 className="font-extrabold text-slate-900 leading-tight mb-1">{selectedProject.title}</h4>
                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{selectedProject.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <button
                                        type="submit"
                                        disabled={bulletinSending || !selectedProjectUuid}
                                        className="w-full py-4 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-hover shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {bulletinSending ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Launching Broadcast Campaign...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Launch Project Bulletin
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-in duration-200 border border-slate-100 flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            {/* Pulsing Alert icon */}
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 text-red-500 shadow-inner animate-bounce">
                                <AlertTriangle size={28} />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">{confirmModal.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed px-2">
                                    {confirmModal.message}
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all text-sm shadow-sm"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all text-sm"
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminSubscribers;
