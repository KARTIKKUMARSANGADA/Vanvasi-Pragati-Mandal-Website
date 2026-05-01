import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Trash2, Eye, X, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../api/axios';

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contact/');
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/contact/${id}`);
        setMessages(messages.filter((msg) => msg.id !== id));
      } catch (error) {
        console.error('Failed to delete message', error);
        alert('Failed to delete message');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AdminLayout title="Contact Messages">
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
                    <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-900">{msg.name}</td>
                      <td className="p-4 px-6">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {msg.email}</span>
                          <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {msg.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 px-6 text-sm text-slate-500">{formatDate(msg.created_at)}</td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedMessage(msg)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="View Message"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
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
    </AdminLayout>
  );
};

export default AdminContacts;
