import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Trash2, Eye, X, Mail, Phone, Calendar, Send } from 'lucide-react';
import api from '../../api/axios';

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Broadcast state
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('selected'); // 'selected' or 'all'
  const [broadcastSending, setBroadcastSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/contact/');
      console.log('GET /contact/ response:', response.data);
      if (Array.isArray(response.data)) {
        setMessages(response.data);
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (uuid) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/contact/${uuid}`);
        setMessages(messages.filter((msg) => msg.uuid !== uuid));
        window.dispatchEvent(new Event('refreshUnreadCount'));
      } catch (error) {
        console.error('Failed to delete message', error);
        alert('Failed to delete message');
      }
    }
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const validEmails = messages.filter(m => m.email).map(m => m.email);
      setSelectedEmails([...new Set(validEmails)]);
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (email) => {
    if (!email) return;
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastBody) {
      alert("Please enter both subject and message.");
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
      alert(res.data.message || 'Broadcast sent successfully!');
      setShowBroadcastModal(false);
      setBroadcastSubject('');
      setBroadcastBody('');
      setSelectedEmails([]);
    } catch (err) {
      console.error('Failed to send broadcast', err);
      alert('Failed to send broadcast message.');
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
      <div className="flex justify-end mb-6">
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
                      checked={messages.length > 0 && selectedEmails.length === new Set(messages.filter(m=>m.email).map(m=>m.email)).size}
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
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-slate-500">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                messages.map((msg) => (
                    <tr key={msg.id} className={`hover:bg-slate-50 transition-colors ${!msg.is_read ? 'bg-slate-50/50 font-medium' : ''}`}>
                      <td className="p-4 px-6 w-12">
                        {msg.email && (
                          <input 
                            type="checkbox" 
                            className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            checked={selectedEmails.includes(msg.email)}
                            onChange={() => handleSelectEmail(msg.email)}
                          />
                        )}
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
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="View Message"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.uuid)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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

    </AdminLayout>
  );
};

export default AdminContacts;
