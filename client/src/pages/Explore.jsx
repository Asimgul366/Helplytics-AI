import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests } from '../services/api';
import Navbar from '../components/layout/Navbar';
import RequestCard from '../components/ui/RequestCard';

const CATEGORIES = ['Technology', 'Health & Wellness', 'Education', 'Finance', 'Legal', 'Career', 'Mental Health', 'Home & DIY', 'Creative Arts', 'Community', 'Relationships', 'Other'];

export default function Explore() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ category: '', urgency: '', skills: '', location: '' });
  const [loading, setLoading] = useState(false);

  const fetchRequests = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (f.category) params.category = f.category;
      if (f.urgency) params.urgency = f.urgency;
      if (f.skills) params.skills = f.skills;
      if (f.location) params.location = f.location;
      const res = await getRequests(params);
      setRequests(res.data.requests);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const applyFilters = () => { setPage(1); fetchRequests(filters, 1); };
  const clearFilters = () => {
    const empty = { category: '', urgency: '', skills: '', location: '' };
    setFilters(empty); setPage(1); fetchRequests(empty, 1);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">EXPLORE / FEED</p>
        <h1 className="text-4xl font-black mb-2">Browse help requests with filterable community context.</h1>
        <p className="text-gray-400 text-sm">Filter by category, urgency, skills, and location to surface the best matches.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-4 gap-6">
        {/* Filters */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">FILTERS</p>
            <h2 className="text-xl font-black text-gray-900 mb-5">Refine the feed</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Urgency</label>
                <select value={filters.urgency} onChange={e => setFilters({ ...filters, urgency: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                  <option value="">All urgency levels</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Skills</label>
                <input value={filters.skills} onChange={e => setFilters({ ...filters, skills: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="React, Figma, Git/GitHub" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                <input value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="Karachi, Lahore, Remote" />
              </div>
              <button onClick={applyFilters} className="w-full py-2 rounded-lg text-sm text-white font-medium" style={{ background: '#0d9488' }}>Apply Filters</button>
              <button onClick={clearFilters} className="w-full py-2 rounded-lg text-sm text-gray-500 bg-gray-50 border border-gray-200">Clear Filters</button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{total} requests found</p>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              {requests.map(r => <RequestCard key={r._id} request={r} onClick={() => navigate(`/requests/${r._id}`)} />)}
              {requests.length === 0 && <div className="text-center py-12 text-gray-400">No requests found.</div>}
            </div>
          )}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchRequests(filters, page - 1); }}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40">← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => { setPage(p => p + 1); fetchRequests(filters, page + 1); }}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
