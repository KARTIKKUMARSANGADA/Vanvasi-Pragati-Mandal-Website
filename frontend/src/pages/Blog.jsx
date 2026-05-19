import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import ApiErrorCard from '../components/common/ApiErrorCard';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState(false);

  const load = () => {
    setErr(false);
    api.get('/blog/?limit=30').then(({ data }) => setPosts(Array.isArray(data) ? data : [])).catch(() => setErr(true));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full pb-24 pt-24 min-h-screen bg-slate-50">
      <SEO title="News & Updates" description="Latest announcements and stories from Vanvasi Pragati Mandal." />
      <div className="max-w-[900px] mx-auto px-4">
        <h1 className="text-4xl font-black text-slate-900 mb-4">News & Updates</h1>
        <p className="text-slate-600 mb-10">Stories, announcements, and field reports.</p>
        {err && <ApiErrorCard onRetry={load} />}
        {!err && posts.length === 0 && (
          <p className="text-slate-500">No posts yet. Check back soon.</p>
        )}
        <div className="space-y-6">
          {posts.map((p) => (
            <motion.article key={p.uuid || p.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <Link to={`/blog/${p.slug || p.uuid}`} className="text-2xl font-bold text-slate-900 hover:text-primary">
                {p.title}
              </Link>
              {p.excerpt && <p className="text-slate-600 mt-3 line-clamp-3">{p.excerpt}</p>}
              <Link to={`/blog/${p.slug || p.uuid}`} className="inline-block mt-4 text-secondary font-semibold text-sm">Read more →</Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
