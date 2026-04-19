import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, helpRequest, solveRequest } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { generateSummary } from '../engine/aiEngine';
import Navbar from '../components/layout/Navbar';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import SkillChip from '../components/ui/SkillChip';
import TrustScoreBar from '../components/ui/TrustScoreBar';
import toast from 'react-hot-toast';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getRequest(id).then(r => setRequest(r.data)).catch(() => toast.error('Request not found')).finally(() => setLoading(false));
  }, [id]);

  const handleHelp = async () => {
    setActionLoading(true);
    try {
      const res = await helpRequest(id);
      setRequest(res.data);
      toast.success('You are now helping!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  const handleSolve = async () => {
    setActionLoading(true);
    try {
      const res = await solveRequest(id);
      setRequest(res.data);
      toast.success('Request marked as solved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!request) return null;

  const isOwner = user?._id === request.owner?._id;
  const isHelper = request.helpers?.some(h => h._id === user?._id);
  const isSolved = request.status === 'solved';
  const summary = generateSummary(request.description);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">REQUEST DETAIL</p>
        <div className="flex gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">{request.category}</span>
          <UrgencyBadge level={request.urgency} />
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isSolved ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
            {isSolved ? 'Solved' : 'Open'}
          </span>
        </div>
        <h1 className="text-4xl font-black mb-3">{request.title}</h1>
        <p className="text-gray-400 text-sm">{request.description}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Left */}
        <div className="col-span-2 space-y-4">
          {/* AI Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI SUMMARY</p>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#0d9488' }}>H</div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">HelpHub AI</p>
                <p className="text-sm text-gray-600">{summary}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {request.tags?.map(t => <SkillChip key={t} label={t} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isSolved && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ACTIONS</p>
              <div className="flex gap-3">
                {!isOwner && !isHelper && (
                  <button onClick={handleHelp} disabled={actionLoading}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: '#0d9488' }}>
                    I can help
                  </button>
                )}
                {isHelper && <span className="px-5 py-2 rounded-lg text-sm font-medium bg-teal-50 text-teal-700">✓ You're helping</span>}
                {isOwner && (
                  <button onClick={handleSolve} disabled={actionLoading}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60">
                    Mark as solved
                  </button>
                )}
                <button onClick={() => navigate('/messages')} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">
                  Message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Requester */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">REQUESTER</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#0d9488' }}>
                {request.owner?.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{request.owner?.name}</p>
                <p className="text-xs text-gray-400">{request.location || 'Remote'}</p>
              </div>
            </div>
          </div>

          {/* Helpers */}
          {request.helpers?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">HELPERS</p>
              <h3 className="font-bold text-gray-900 mb-3">People ready to support</h3>
              <div className="space-y-3">
                {request.helpers.map(h => (
                  <div key={h._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: h.trustScore > 80 ? '#f97316' : '#6366f1' }}>
                        {h.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                        <p className="text-xs text-gray-400">{h.skills?.slice(0, 3).join(', ')}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-teal-50 text-teal-700">Trust {h.trustScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
