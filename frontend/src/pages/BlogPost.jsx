import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!slug) return;
    api.get(`/blog/${slug}`).then(({ data }) => setPost(data)).catch(() => setPost(null));
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pt-24">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <article className="max-w-[800px] mx-auto px-4 pt-24 pb-20">
      <SEO title={post.title} description={post.excerpt || post.title} />
      <Link to="/blog" className="text-secondary font-semibold text-sm mb-6 inline-block">← All posts</Link>
      <h1 className="text-4xl font-black text-slate-900 mb-6">{post.title}</h1>
      <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">{post.content}</div>
    </article>
  );
};

export default BlogPost;
