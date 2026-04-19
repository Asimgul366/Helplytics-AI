import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, getLeaderboard } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { computeTrendPulse, getUrgencyWatch, matchMentors, recommendRequests } from '../engine/aiEngine';
import Navbar from '../components/layout/Navbar';
import RequestCard from '../components/ui/RequestCard';
import TrustScoreBar from '../components/ui/TrustScoreBar';
import SkillChip from '../components/ui/SkillChip';

export default function AICenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trend, setTrend] = useState({ categories: [], tags: [] });
  const [urgencyWatch, setUrgencyWatch] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    Promise.all([
      getRequests({ page: 1 }),
      getLeaderboard(),
    ]).then(([reqRes, helpRes]) => {
      const allRequests = reqRes.data.requests;
      const allHelpers = helpRes.data;
      setTrend(computeTrendPulse(allRequests));
      setUrgencyWatch(getUrgencyWatch(allRequests));
      setMentors(matchMentors(allHelpers, user?.interests || []));
      setRecommended(recommendRequests(allRequests, user?.skills || []));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">AI CENTER</p>
        <h1 className="text-4xl font-black mb-2">See what the platform intelligence is noticing.</h1>
        <p className="text-gray-400 text-sm">AI-like insights summarize demand trends, helper readiness, urgency signals, and request recommendations.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#0d9488' }}>TREND PULSE</p>
            <h3 className="text-2xl font-black text-gray-900">{trend.categories[0] || 'Technology'}</h3>
            <p className="text-xs text-gray-400 mt-1">Most common support area based on active community requests.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>URGENCY WATCH</p>
            <h3 className="text-2xl font-black text-gray-900">{urgencyWatch.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Requests currently flagged high priority by the urgency detector.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6366f1' }}>MENTOR POOL</p>
            <h3 className="text-2xl font-black text-gray-900">{mentors.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Trusted helpers with strong response history and contribution signals.</p>
          </div>
        </div>

        {/* Trend Tags */}
        {trend.tags.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">TRENDING TAGS</p>
            <div className="flex flex-wrap gap-2">
              {trend.tags.map(t => <SkillChip key={t} label={t} />)}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">AI RECOMMENDATIONS</p>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Requests needing attention</h2>
          <div className="space-y-3">
            {urgencyWatch.slice(0, 4).map(r => (
              <div key={r._id} onClick={() => navigate(`/requests/${r._id}`)}
                className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                <p className="text-xs text-gray-500 mb-2">{r.description?.slice(0, 120)}...</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">{r.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{r.urgency}</span>
                </div>
              </div>
            ))}
            {urgencyWatch.length === 0 && <p className="text-gray-400 text-sm">No high-urgency requests right now.</p>}
          </div>
        </div>

        {/* Mentor Pool */}
        {mentors.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">MENTOR POOL</p>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Helpers matching your interests</h2>
            <div className="grid grid-cols-2 gap-3">
              {mentors.slice(0, 4).map(m => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#0d9488' }}>
                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.skills?.slice(0, 2).join(', ')}</p>
                    <TrustScoreBar score={m.trustScore} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Requests */}
        {recommended.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">FOR YOU</p>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Requests matching your skills</h2>
            <div className="space-y-3">
              {recommended.map(r => <RequestCard key={r._id} request={r} onClick={() => navigate(`/requests/${r._id}`)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
