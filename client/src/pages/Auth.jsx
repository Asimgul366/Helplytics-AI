import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'community@helphub.ai', password: '•••••••', role: 'both' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (tab === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password.trim()) e.password = 'Password is required';
    if (tab === 'signup' && !form.role) e.role = 'Role is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = tab === 'login'
        ? await loginApi({ email: form.email, password: form.password })
        : await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      login(res.data);
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!');
      navigate(tab === 'signup' ? '/onboarding' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      if (msg.includes('Email')) setErrors({ email: msg });
      else if (msg.includes('credentials')) setErrors({ email: 'Invalid email or password' });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ background: '#1a2e2a' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#0d9488' }}>H</div>
            <span className="text-white font-semibold text-sm">HelpHub AI</span>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-400 text-sm hover:text-white">Home</Link>
            <Link to="/explore" className="text-gray-400 text-sm hover:text-white">Explore</Link>
            <Link to="/leaderboard" className="text-gray-400 text-sm hover:text-white">Leaderboard</Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl mt-12">
        {/* Left */}
        <div className="p-10 text-white" style={{ background: '#1a2e2a' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">COMMUNITY ACCESS</p>
          <h2 className="text-4xl font-black mb-4">Enter the support network.</h2>
          <p className="text-gray-400 text-sm mb-6">Choose a demo identity, set your role, and jump into a multi-page product flow designed for asking, offering, and tracking help with a premium interface.</p>
          <ul className="space-y-2">
            {['Role-based entry for Need Help, Can Help, or Both', 'Direct path into dashboard, requests, AI Center, and community feed', 'Persistent session powered by localStorage'].map(i => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 text-teal-400">•</span>{i}
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div className="bg-white p-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#0d9488' }}>LOGIN / SIGNUP</p>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Authenticate your community profile</h2>

          <div className="flex gap-2 mb-6">
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'text-gray-500 bg-gray-100'}`}
                style={tab === t ? { background: '#0d9488' } : {}}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="Your name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            {tab === 'login' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Select demo user</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  onChange={e => {
                    const map = { 'Ayesha Khan': 'ayesha@helplytics.ai', 'Hassan Ali': 'hassan@helplytics.ai', 'Sara Noor': 'sara@helplytics.ai' };
                    setForm({ ...form, email: map[e.target.value] || form.email, password: 'password123' });
                  }}>
                  <option>Ayesha Khan</option>
                  <option>Hassan Ali</option>
                  <option>Sara Noor</option>
                </select>
              </div>
            )}

            {tab === 'signup' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Role selection</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                  <option value="seeker">Need Help</option>
                  <option value="helper">Can Help</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="email@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: '#0d9488' }}>
              {loading ? 'Please wait...' : 'Continue to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
