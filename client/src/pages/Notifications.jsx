import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead } from '../services/api';
import Navbar from '../components/layout/Navbar';

const TYPE_ICONS = {
  match: '🤝',
  status: '✅',
  request: '📋',
  reputation: '⭐',
};

const TYPE_LABELS = {
  match: 'Match',
  status: 'Status',
  request: 'Request',
  reputation: 'Reputation',
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(r => {
      setNotifications(r.data);
      markAllRead().catch(() => {});
    }).catch(() => {});
  }, []);

  const handleClick = (n) => {
    if (n.relatedRequest) navigate(`/requests/${n.relatedRequest._id || n.relatedRequest}`);
    else if (n.type === 'reputation') navigate('/leaderboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">NOTIFICATIONS</p>
        <h1 className="text-4xl font-black mb-2">Stay updated on requests, helpers, and trust signals.</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LIVE UPDATES</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Notification feed</h2>
          <div className="space-y-1">
            {notifications.map(n => (
              <div key={n._id} onClick={() => handleClick(n)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div>
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[n.type]} • {timeAgo(n.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${n.read ? 'text-gray-400' : 'text-teal-700 bg-teal-50'}`}>
                  {n.read ? 'Read' : 'Unread'}
                </span>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-center text-gray-400 py-8">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
