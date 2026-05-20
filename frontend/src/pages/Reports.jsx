import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import ApiErrorCard from '../components/common/ApiErrorCard';

const Reports = () => {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(false);

  const load = () => {
    setErr(false);
    api.get('/reports/').then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => setErr(true));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full pb-24 pt-32 min-h-screen bg-white">
      <SEO title="Transparency & Downloads" description="Annual reports, certificates, and public documents." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Transparency & Downloads</h1>
          <p className="text-slate-600 mb-10">Annual reports, audit documents, and certificates for donors and partners.</p>
          {err && <ApiErrorCard onRetry={load} />}
          {!err && items.length === 0 && <p className="text-slate-500">Documents will be listed here when available.</p>}
          <ul className="space-y-4">
            {items.map((r) => (
              <li key={r.uuid || r.id} className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">{r.title}</p>
                  {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
                  {r.year && <p className="text-xs text-slate-400 mt-1">Year: {r.year}</p>}
                </div>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
                  <Download size={18} /> Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
