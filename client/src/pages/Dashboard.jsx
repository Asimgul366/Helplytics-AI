import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getRecentRequests, getStats } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { generateInsights } from '../engine/aiEngine';
import Navbar from '../components/layout/Navbar';
import RequestCard from '../components/ui/RequestCard';
import TrustScoreBar from '../components/ui/TrustScoreBar';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    getMe().then(r => setProfile(r.data)).catch(() => {});
    getRecentRequests().then(r => setRecent(r.data)).catch(() => {});
    getStats().then(r => {
      setStats(r.data);
      setInsights(generateInsights({}, r.data));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      {/* Banner */}
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">DASHBOARD</p>
        <h1 className="text-4xl font-black mb-2">Welcome back, {profile?.name?.split(' ')[0]}.</h1>
        <p className="text-gray-400 text-sm">Here's what's happening in your community today.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trust Score', value: `${profile?.trustScore || 0}%`, sub: 'Your reputation score' },
            { label: 'Total Members', value: `${stats.totalUsers || 0}+`, sub: 'Active community members' },
            { label: 'Requests', value: `${stats.activeHelpers || 0}+`, sub: 'Help requests posted' },
            { label: 'Solved', value: `${stats.totalResolved || 0}+`, sub: 'Problems resolved' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Requests</h2>
            <div className="space-y-3">
              {recent.map(r => (
                <RequestCard key={r._id} request={r} onClick={() => navigate(`/requests/${r._id}`)} />
              ))}
              {recent.length === 0 && <p className="text-gray-400 text-sm">No requests yet.</p>}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Trust Score */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">YOUR TRUST SCORE</p>
              <TrustScoreBar score={profile?.trustScore || 0} />
              <p className="text-xs text-gray-400 mt-2">Earn points by helping others and getting requests solved.</p>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI INSIGHTS</p>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-600">
                    <span style={{ color: '#0d9488' }}>✦</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">QUICK ACTIONS</p>
              <div className="space-y-2">
                <button onClick={() => navigate('/create-request')}
                  className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#0d9488' }}>
                  + Create Request
                </button>
                <button onClick={() => navigate('/explore')}
                  className="w-full py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">
                  Explore Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
