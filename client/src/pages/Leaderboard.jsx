import { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import TrustScoreBar from '../components/ui/TrustScoreBar';
import Badge from '../components/ui/Badge';

const AVATAR_COLORS = ['#f97316', '#6366f1', '#0d9488', '#ec4899', '#14b8a6', '#8b5cf6'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    getLeaderboard().then(r => setHelpers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">LEADERBOARD</p>
        <h1 className="text-4xl font-black mb-2">Recognize the people who keep the community moving.</h1>
        <p className="text-gray-400 text-sm">Trust score, contribution count, and badges create visible momentum for reliable helpers.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 gap-6">
        {/* Rankings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">TOP HELPERS</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Rankings</h2>
          <div className="space-y-4">
            {helpers.map((h, i) => {
              const isMe = h._id === user?._id;
              return (
                <div key={h._id} className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'border-2' : 'border border-gray-100'}`}
                  style={isMe ? { borderColor: '#0d9488', background: '#f0fdfa' } : {}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {h.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-semibold">#{i + 1}</span>
                      <p className="text-sm font-semibold text-gray-800 truncate">{h.name}</p>
                      {isMe && <span className="text-xs text-teal-600 font-medium">(you)</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{h.skills?.slice(0, 3).join(', ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{h.trustScore}%</p>
                    <p className="text-xs text-gray-400">{h.solvedCount} contributions</p>
                  </div>
                </div>
              );
            })}
            {helpers.length === 0 && <p className="text-gray-400 text-sm">No helpers yet.</p>}
          </div>
        </div>

        {/* Badge System */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">BADGE SYSTEM</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Trust and achievement</h2>
          <div className="space-y-5">
            {helpers.slice(0, 5).map((h, i) => (
              <div key={h._id}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{h.name}</p>
                    <p className="text-xs text-gray-400">{h.badges?.map(b => b.replace(/-/g, ' ')).join(' • ') || 'No badges yet'}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${h.trustScore}%`, background: i === 0 ? '#0d9488' : i === 1 ? '#f59e0b' : '#6366f1' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Badge Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">BADGE THRESHOLDS</p>
            <div className="space-y-2">
              {[
                { badge: 'first-helper', threshold: '1 solved request' },
                { badge: 'rising-star', threshold: '10 solved requests' },
                { badge: 'community-champion', threshold: '50 solved requests' },
                { badge: 'legend', threshold: '100 solved requests' },
              ].map(b => (
                <div key={b.badge} className="flex items-center justify-between">
                  <Badge type={b.badge} />
                  <span className="text-xs text-gray-400">{b.threshold}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
