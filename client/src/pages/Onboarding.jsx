import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMe } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { suggestSkills } from '../engine/aiEngine';
import SkillChip from '../components/ui/SkillChip';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', skills: [], interests: [], location: '' });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      const updated = [...form.skills, skillInput.trim()];
      setForm({ ...form, skills: updated });
      setSuggestions(suggestSkills(updated));
      setSkillInput('');
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !form.interests.includes(interestInput.trim())) {
      setForm({ ...form, interests: [...form.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await updateMe(form);
      updateUser(res.data);
      toast.success('Profile saved!');
      navigate('/dashboard');
    } catch { toast.error('Failed to save profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      {/* Banner */}
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">ONBOARDING</p>
        <h1 className="text-4xl font-black mb-2">Set up your community identity.</h1>
        <p className="text-gray-400 text-sm">Tell us about your skills and interests so we can surface the right matches.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Your display name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Karachi, Lahore, Remote..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="React, Figma, Python..." />
              <button onClick={addSkill} className="px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ background: '#0d9488' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => <SkillChip key={s} label={s} onDismiss={l => setForm({ ...form, skills: form.skills.filter(x => x !== l) })} />)}
            </div>
          </div>
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">AI suggestions — click to add:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => setForm({ ...form, skills: [...form.skills, s] })}
                    className="px-2.5 py-1 rounded-full text-xs border border-dashed text-teal-600 border-teal-300 hover:bg-teal-50">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Interests</label>
            <div className="flex gap-2 mb-2">
              <input value={interestInput} onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInterest()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="Hackathons, UI/UX..." />
              <button onClick={addInterest} className="px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ background: '#0d9488' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.interests.map(i => <SkillChip key={i} label={i} onDismiss={l => setForm({ ...form, interests: form.interests.filter(x => x !== l) })} />)}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60"
            style={{ background: '#0d9488' }}>
            {loading ? 'Saving...' : 'Save and continue'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-lg text-sm text-gray-500 bg-white border border-gray-200">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
