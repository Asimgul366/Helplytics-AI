import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStats } from '../services/api';

export default function Landing() {
  const [stats, setStats] = useState({ totalUsers: 384, totalResolved: 69, activeHelpers: 72 });

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a2e2a' }} className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#0d9488' }}>H</div>
          <span className="text-white font-semibold text-sm">HelpHub AI</span>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Home', to: '/' },
            { label: 'Explore', to: '/explore' },
            { label: 'Leaderboard', to: '/leaderboard' },
            { label: 'AI Center', to: '/ai-center' },
          ].map(l => (
            <Link key={l.label} to={l.to} className="text-gray-400 text-sm hover:text-white cursor-pointer">{l.label}</Link>
          ))}
          <span className="text-xs text-gray-400 border border-gray-600 px-3 py-1 rounded-full">Live community signals</span>
          <Link to="/auth" className="px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#0d9488' }}>
            Join the platform
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">SMIT GRAND CODING NIGHT 2026</p>
            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">
              Find help faster.<br />Become help that<br />matters.
            </h1>
            <p className="text-gray-500 text-sm mb-6 max-w-md">
              HelpHub AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches across the platform.
            </p>
            <div className="flex gap-3 mb-8">
              <Link to="/auth" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#0d9488' }}>
                Open product demo
              </Link>
              <Link to="/auth" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50">
                Post a request
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'MEMBERS', value: `${stats.totalUsers}+`, desc: 'Students, mentors, and helpers in the loop.' },
                { label: 'REQUESTS', value: `${stats.activeHelpers}+`, desc: 'Support posts shared across learning journeys.' },
                { label: 'SOLVED', value: `${stats.totalResolved}+`, desc: 'Problems resolved through fast community action.' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="rounded-2xl p-8 text-white" style={{ background: '#1a2e2a' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">LIVE PRODUCT FEEL</p>
              <div className="w-8 h-8 rounded-full" style={{ background: '#f59e0b' }} />
            </div>
            <h2 className="text-3xl font-black mb-4">More than a form.<br />More like an ecosystem.</h2>
            <p className="text-gray-400 text-sm mb-6">A polished multi-page experience inspired by product platforms, with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum.</p>
            {[
              { title: 'AI request intelligence', desc: 'Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots.' },
              { title: 'Community trust graph', desc: 'Badges, helper rankings, trust score boosts, and visible contribution history.' },
              { title: '100%', desc: 'Top trust score currently active across the sample mentor network.' },
            ].map(f => (
              <div key={f.title} className="bg-white/10 rounded-xl p-4 mb-3">
                <p className="font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Flow */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">CORE FLOW</p>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900">From struggling alone to solving together</h2>
            <Link to="/auth" className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">Try onboarding AI</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Ask for help clearly', desc: 'Create structured requests with category, urgency, AI suggestions, and tags that attract the right people.' },
              { title: 'Discover the right people', desc: 'Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens.' },
              { title: 'Track real contribution', desc: 'Trust scores, badges, solved requests, and rankings help the community recognize meaningful support.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          HelpHub AI is built as a premium-feel, multi-page community support product using React, Node.js, Express, and MongoDB.
        </p>
      </div>
    </div>
  );
}
