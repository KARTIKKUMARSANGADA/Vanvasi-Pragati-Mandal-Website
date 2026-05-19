import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../api/axios';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', is_published: false });

  const load = () => {
    api.get('/blog/manage/all').then(({ data }) => setPosts(Array.isArray(data) ? data : [])).catch(() => setPosts([]));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/blog/', { ...form, slug: form.slug || undefined });
      setForm({ title: '', slug: '', excerpt: '', content: '', is_published: false });
      load();
      alert('Post created');
    } catch {
      alert('Create failed — ensure blog_posts table exists (see supabase/migrations).');
    }
  };

  const del = async (uuid) => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/blog/${uuid}`);
    load();
  };

  return (
    <AdminLayout title="Blog / News">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={create} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <h2 className="font-bold text-lg mb-2">New post</h2>
          <input required className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea required className="w-full border rounded-lg px-3 py-2 min-h-[160px]" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published
          </label>
          <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl">Publish</button>
        </form>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-lg mb-4">All posts</h2>
          <ul className="space-y-3 max-h-[500px] overflow-y-auto">
            {posts.map((p) => (
              <li key={p.uuid} className="flex justify-between gap-2 border-b pb-2">
                <span className="font-medium">{p.title}</span>
                <button type="button" className="text-red-600 text-sm font-bold" onClick={() => del(p.uuid)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
