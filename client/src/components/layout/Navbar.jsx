import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../../services/api';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explore', label: 'Explore' },
  { to: '/create-request', label: 'Create Request' },
  { to: '/ai-center', label: 'AI Center' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/messages', label: 'Messages' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      getUnreadCount().then(r => setUnread(r.data.count)).catch(() => {});
    }
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ background: '#1a2e2a' }} className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#0d9488' }}>H</div>
          <span className="text-white font-semibold text-sm">HelpHub AI</span>
        </Link>
        <div className="flex items-center gap-1 flex-wrap">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={pathname === link.to ? { background: 'rgba(13,148,136,0.25)', color: '#5eead4' } : {}}
            >
              {link.label}
              {link.label === 'Notifications' && unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ background: '#ef4444', fontSize: '10px' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ))}
          <button onClick={handleLogout} className="ml-2 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
