import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Trash2, Eye, EyeOff, X, Mail, Phone, Calendar, Send, AlertTriangle, Download, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { supabase } from '../../supabase';

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Selection state (Decoupled from email, uses UUID/ID)
  const [selectedUuids, setSelectedUuids] = useState([]);
  
  // Live Auto-Refresh polling state
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: null
  });

  // Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('selected'); // 'selected' or 'all'
  const [broadcastSending, setBroadcastSending] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Search & Status filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);
  const [hasMore, setHasMore] = useState(true);

  // Derive unique selected emails dynamically from selected messages for broadcasting
  const selectedEmails = [...new Set(
    messages
      .filter(m => selectedUuids.includes(m.uuid || m.id))
      .map(m => m.email)
      .filter(Boolean)
  )];

  const fetchMessages = async (currentSkip = skip) => {
    try {
      const response = await api.get(`/contact/?skip=${currentSkip}&limit=${limit}`);
      console.log('GET /contact/ response:', response.data);
      if (Array.isArray(response.data)) {
        setMessages(response.data);
        if (response.data.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        console.error('Expected array for messages but got:', response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages. Details:', JSON.stringify(error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Live WebSocket Change Data Capture (CDC) Sync
  useEffect(() => {
    fetchMessages(skip);

    if (!autoRefresh) return;

    // Listen to changes on contact_messages table and refresh instantly
    const channel = supabase
      .channel('live-contacts-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        fetchMessages(skip);
        window.dispatchEvent(new Event('refreshUnreadCount'));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoRefresh, skip, limit]);

  const handlePageChange = (newSkip) => {
    setSkip(newSkip);
    fetchMessages(newSkip);
  };

  const handleExportCSV = () => {
    if (messages.length === 0) {
      showToast("No messages to export.", "error");
      return;
    }
    
    // Header columns
    const headers = ["Name", "Email", "Phone", "Message", "Read Status", "Date Received"];
    
    // Compile rows
    const csvRows = [
      headers.join(","), // Header row
      ...messages.map(msg => [
        `"${String(msg.name || '').replace(/"/g, '""')}"`,
        `"${String(msg.email || '').replace(/"/g, '""')}"`,
        `"${String(msg.phone || '').replace(/"/g, '""')}"`,
        `"${String(msg.message || '').replace(/"/g, '""')}"`,
        msg.is_read ? "Read" : "Unread",
        `"${new Date(msg.created_at).toLocaleString()}"`
      ].join(","))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VPM_Contact_Messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Helper to trigger our branded confirmation modal
  const triggerConfirm = ({ title, message, confirmText, cancelText, type, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title: title || 'Are you sure?',
      message: message || '',
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      type: type || 'danger',
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDelete = (uuid) => {
    triggerConfirm({
      title: 'Delete Message',
      message: 'Are you sure you want to permanently delete this contact message? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/contact/${uuid}`);
          setMessages(prev => prev.filter((msg) => msg.uuid !== uuid));
          setSelectedUuids(prev => prev.filter(id => id !== uuid));
          window.dispatchEvent(new Event('refreshUnreadCount'));
          showToast('Message deleted successfully');
        } catch (error) {
          console.error('Failed to delete message', error);
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        const msgUuid = msg.uuid || msg.id;
        await api.put(`/contact/${msgUuid}/read`);
        setMessages(prev => prev.map(m => (m.uuid === msgUuid || m.id === msgUuid) ? { ...m, is_read: true } : m));
        window.dispatchEvent(new Event('refreshUnreadCount'));
      } catch (err) {
        console.error("Failed to mark message as read", err);
      }
    }
  };

  // Derive filtered messages dynamically on each render
  const filteredMessages = messages.filter(msg => {
    // 1. Filter by status
    if (statusFilter === 'unread' && msg.is_read) return false;
    if (statusFilter === 'read' && !msg.is_read) return false;

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = String(msg.name || '').toLowerCase();
      const email = String(msg.email || '').toLowerCase();
      const phone = String(msg.phone || '').toLowerCase();
      const message = String(msg.message || '').toLowerCase();
      
      return name.includes(query) || email.includes(query) || phone.includes(query) || message.includes(query);
    }
    
    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUuids(filteredMessages.map(m => m.uuid || m.id));
    } else {
      setSelectedUuids([]);
    }
  };

  const handleSelectRow = (uuid) => {
    if (!uuid) return;
    setSelectedUuids(prev => 
      prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
    );
  };

  // Bulk Actions API integrations
  const handleBulkRead = async () => {
    if (selectedUuids.length === 0) return;
    try {
      await api.post('/contact/bulk/read', selectedUuids);
      setMessages(prev => 
        prev.map(m => selectedUuids.includes(m.uuid || m.id) ? { ...m, is_read: true } : m)
      );
      showToast(`${selectedUuids.length} messages marked as read`);
      setSelectedUuids([]);
      window.dispatchEvent(new Event('refreshUnreadCount'));
    } catch (err) {
      console.error("Failed to mark selected messages as read", err);
      showToast("Failed to mark selected messages as read", "error");
    }
  };

  const handleBulkUnread = async () => {
    if (selectedUuids.length === 0) return;
    try {
      await api.post('/contact/bulk/unread', selectedUuids);
      setMessages(prev => 
        prev.map(m => selectedUuids.includes(m.uuid || m.id) ? { ...m, is_read: false } : m)
      );
      showToast(`${selectedUuids.length} messages marked as unread`);
      setSelectedUuids([]);
      window.dispatchEvent(new Event('refreshUnreadCount'));
    } catch (err) {
      console.error("Failed to mark selected messages as unread", err);
      showToast("Failed to mark selected messages as unread", "error");
    }
  };

  const handleBulkDelete = () => {
    if (selectedUuids.length === 0) return;
    triggerConfirm({
      title: 'Delete Selected Messages',
      message: `Are you sure you want to permanently delete the ${selectedUuids.length} selected contact messages? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.post('/contact/bulk/delete', selectedUuids);
          const deletedCount = selectedUuids.length;
          setMessages(prev => prev.filter(m => !selectedUuids.includes(m.uuid || m.id)));
          showToast(`${deletedCount} messages deleted successfully`);
          setSelectedUuids([]);
          window.dispatchEvent(new Event('refreshUnreadCount'));
        } catch (err) {
          console.error("Failed to delete selected messages", err);
          showToast("Failed to delete selected messages", "error");
        }
      }
    });
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastBody) {
      showToast("Please enter both subject and message.", "error");
      return;
    }

    setBroadcastSending(true);
    try {
      const payload = {
        subject: broadcastSubject,
        body: broadcastBody,
        emails: broadcastTarget === 'selected' ? selectedEmails : []
      };

      const res = await api.post('/subscribers/broadcast', payload);
      showToast(res.data.message || 'Broadcast sent successfully!');
      setShowBroadcastModal(false);
      setBroadcastSubject('');
      setBroadcastBody('');
      setSelectedUuids([]);
    } catch (err) {
      console.error('Failed to send broadcast', err);
      showToast('Failed to send broadcast message.', 'error');
    } finally {
      setBroadcastSending(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AdminLayout title="Contact Messages">
      {/* Custom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
        {/* Dynamic Bulk Actions Pill */}
        {selectedUuids.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 bg-slate-100/90 p-2 px-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-sm font-bold text-slate-700">
              {selectedUuids.length} selected
            </span>
            <div className="hidden sm:block w-px h-5 bg-slate-200" />
            <button
              onClick={handleBulkRead}
              className="px-3 py-1.5 bg-white text-slate-700 hover:text-emerald-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-in fade-in duration-200"
              title="Mark all selected as read"
            >
              <Eye size={14} className="text-slate-500" />
              Mark Read
            </button>
            <button
              onClick={handleBulkUnread}
              className="px-3 py-1.5 bg-white text-slate-700 hover:text-blue-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-in fade-in duration-200"
              title="Mark all selected as unread"
            >
              <EyeOff size={14} className="text-slate-500" />
              Mark Unread
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:text-white hover:bg-red-600 font-bold text-xs rounded-xl border border-red-200 hover:border-red-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-in fade-in duration-200"
              title="Delete all selected"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        ) : (
          <p className="text-slate-500 text-sm hidden md:block">
            View and manage inquiry messages from your supporters.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
          {/* Live Sync Toggle switch */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-sm select-none">
            <div className="relative flex h-2 w-2">
              {autoRefresh && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Auto Sync
            </span>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoRefresh ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            title="Export messages to CSV spreadsheet"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={() => {
              setBroadcastTarget(selectedEmails.length > 0 ? 'selected' : 'all');
              setShowBroadcastModal(true);
            }}
            className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Send size={18} />
            Broadcast Message
          </button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full items-center justify-between animate-in fade-in duration-300">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200/60 shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 w-full sm:w-auto justify-center ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
          >
            All Messages
            <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {messages.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 w-full sm:w-auto justify-center ${statusFilter === 'unread' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Unread
            {messages.filter(m => !m.is_read).length > 0 && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            )}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === 'unread' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-700'}`}>
              {messages.filter(m => !m.is_read).length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 w-full sm:w-auto justify-center ${statusFilter === 'read' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Read
            <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {messages.filter(m => m.is_read).length}
            </span>
          </button>
        </div>

        {/* Text Search Input */}
        <div className="relative w-full sm:max-w-xs flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, content..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-slate-800 shadow-sm"
          />
          <svg
            className="absolute left-3 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-sm uppercase tracking-wider">
                  <th className="p-4 px-6 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      checked={filteredMessages.length > 0 && filteredMessages.every(m => selectedUuids.includes(m.uuid || m.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 px-6">Name</th>
                  <th className="p-4 px-6">Contact Info</th>
                  <th className="p-4 px-6">Date</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-slate-500">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                filteredMessages.map((msg) => (
                    <tr key={msg.id} className={`hover:bg-slate-50 transition-colors ${!msg.is_read ? 'bg-slate-50/50 font-medium' : ''}`}>
                      <td className="p-4 px-6 w-12">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          checked={selectedUuids.includes(msg.uuid || msg.id)}
                          onChange={() => handleSelectRow(msg.uuid || msg.id)}
                        />
                      </td>
                      <td className="p-4 px-6 whitespace-normal break-words max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {!msg.is_read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
                          )}
                          <span className={`text-slate-900 ${!msg.is_read ? 'font-black' : 'font-semibold'}`}>
                            {String(msg.name || 'Anonymous')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {String(msg.email || 'No Email')}</span>
                          <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {String(msg.phone || 'No Phone')}</span>
                        </div>
                      </td>
                      <td className="p-4 px-6 text-sm text-slate-500">{formatDate(msg.created_at || new Date())}</td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSelectMessage(msg)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center animate-in fade-in"
                            title="View Message"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.uuid)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center animate-in fade-in"
                            title="Delete Message"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm font-bold text-slate-500">
              Showing {messages.length > 0 ? skip + 1 : 0} to {skip + messages.length} messages
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => handlePageChange(skip - limit)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-xs"
              >
                Previous
              </button>
              <button
                disabled={!hasMore}
                onClick={() => handlePageChange(skip + limit)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900">Message Details</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Name</label>
                  <p className="text-slate-900 font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date Received</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400"/> 
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary font-medium hover:underline flex items-center gap-2">
                    <Mail size={16} /> {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone</label>
                  <a href={`tel:${selectedMessage.phone}`} className="text-slate-900 font-medium hover:text-primary flex items-center gap-2">
                    <Phone size={16} className="text-slate-400"/> {selectedMessage.phone}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl mt-auto">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Your Contact Message`}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-green-500/30"
              >
                <Mail size={18} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Send size={20} className="text-secondary" /> Compose Broadcast
              </h2>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Target Audience</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${broadcastTarget === 'selected' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input 
                        type="radio" 
                        name="target" 
                        value="selected" 
                        checked={broadcastTarget === 'selected'} 
                        onChange={() => setBroadcastTarget('selected')}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="font-bold text-slate-900">Selected Contacts</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">Send to the {selectedEmails.length} contacts selected in the table.</p>
                  </label>
                  
                  <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${broadcastTarget === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input 
                        type="radio" 
                        name="target" 
                        value="all" 
                        checked={broadcastTarget === 'all'} 
                        onChange={() => setBroadcastTarget('all')}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="font-bold text-slate-900">All Subscribers</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">Broadcast to all active newsletter subscribers.</p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Subject</label>
                <input 
                  type="text" 
                  value={broadcastSubject}
                  onChange={e => setBroadcastSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-slate-900"
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Message Body</label>
                <textarea 
                  value={broadcastBody}
                  onChange={e => setBroadcastBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows="6"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-slate-900 resize-none"
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">The message will automatically be formatted nicely using the official Vanvasi Pragati Mandal email template.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                disabled={broadcastSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={broadcastSending || (broadcastTarget === 'selected' && selectedEmails.length === 0)}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {broadcastSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminContacts;
