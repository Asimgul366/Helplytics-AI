import { useEffect, useState } from 'react';
import { getMe, updateMe, getRequests } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import TrustScoreBar from '../components/ui/TrustScoreBar';
import Badge from '../components/ui/Badge';
import SkillChip from '../components/ui/SkillChip';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', skills: [], interests: [], location: '' });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [contributions, setContributions] = useState({ created: [], helped: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe().then(r => {
      setProfile(r.data);
      setForm({ name: r.data.name, skills: r.data.skills || [], interests: r.data.interests || [], location: r.data.location || '' });
    }).catch(() => {});
    getRequests({ page: 1 }).then(r => {
      const all = r.data.requests;
      setContributions({
        created: all.filter(req => req.owner?._id === user?._id || req.owner === user?._id),
        helped: all.filter(req => req.helpers?.some(h => h._id === user?._id || h === user?._id)),
      });
    }).catch(() => {});
  }, []);

  const startEdit = () => {
    setForm({ name: profile.name, skills: [...(profile.skills || [])], interests: [...(profile.interests || [])], location: profile.location || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return; }
    setSaving(true);
    try {
      const res = await updateMe(form);
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !form.interests.includes(interestInput.trim())) {
      setForm({ ...form, interests: [...form.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const roleLabel = { seeker: 'Need Help', helper: 'Can Help', both: 'Both' };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">PROFILE</p>
        <h1 className="text-4xl font-black mb-1">{profile?.name}</h1>
        <p className="text-gray-400 text-sm">{roleLabel[profile?.role]} • {profile?.location || 'Remote'}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 gap-6">
        {/* Public Profile */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">PUBLIC PROFILE</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Skills and reputation</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trust score</span>
              <span className="text-sm font-bold text-gray-900">{profile?.trustScore || 0}%</span>
            </div>
            <TrustScoreBar score={profile?.trustScore || 0} />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contributions</span>
              <span className="text-sm font-bold text-gray-900">{profile?.solvedCount || 0}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map(s => <SkillChip key={s} label={s} />) || <span className="text-xs text-gray-400">No skills added</span>}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Badges</p>
              <div className="flex flex-wrap gap-2">
                {profile?.badges?.length ? profile.badges.map(b => <Badge key={b} type={b} />) : <span className="text-xs text-gray-400">No badges yet</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">EDIT PROFILE</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Update your identity</h2>
          {!editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-800">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-800">{profile?.location || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {profile?.interests?.map(i => <SkillChip key={i} label={i} />) || <span className="text-xs text-gray-400">None</span>}
                </div>
              </div>
              <button onClick={startEdit} className="w-full py-2.5 rounded-lg text-white font-semibold text-sm mt-2" style={{ background: '#0d9488' }}>
                Edit profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Skills</label>
                <div className="flex gap-2 mb-1">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Add skill" />
                  <button onClick={addSkill} className="px-3 py-2 rounded-lg text-sm text-white" style={{ background: '#0d9488' }}>+</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.skills.map(s => <SkillChip key={s} label={s} onDismiss={l => setForm({ ...form, skills: form.skills.filter(x => x !== l) })} />)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Interests</label>
                <div className="flex gap-2 mb-1">
                  <input value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addInterest()}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Add interest" />
                  <button onClick={addInterest} className="px-3 py-2 rounded-lg text-sm text-white" style={{ background: '#0d9488' }}>+</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.interests.map(i => <SkillChip key={i} label={i} onDismiss={l => setForm({ ...form, interests: form.interests.filter(x => x !== l) })} />)}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60" style={{ background: '#0d9488' }}>
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-500 bg-gray-50 border border-gray-200">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
