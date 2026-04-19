import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { suggestCategory, suggestTags, detectUrgency, rewriteDescription } from '../engine/aiEngine';
import Navbar from '../components/layout/Navbar';
import SkillChip from '../components/ui/SkillChip';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology', 'Health & Wellness', 'Education', 'Finance', 'Legal', 'Career', 'Mental Health', 'Home & DIY', 'Creative Arts', 'Community', 'Relationships', 'Other'];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', tags: [], category: '', urgency: 'Low', location: '' });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({ category: '', tags: [], urgency: '', rewrite: '' });
  const debouncedDesc = useDebounce(form.description, 500);

  useEffect(() => {
    if (debouncedDesc.trim().length > 10) {
      setAiSuggestions({
        category: suggestCategory(debouncedDesc),
        tags: suggestTags(debouncedDesc),
        urgency: detectUrgency(debouncedDesc),
        rewrite: '',
      });
    }
  }, [debouncedDesc]);

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const applyAI = () => {
    setForm(f => ({
      ...f,
      category: aiSuggestions.category || f.category,
      urgency: aiSuggestions.urgency || f.urgency,
      tags: [...new Set([...f.tags, ...aiSuggestions.tags])],
    }));
    toast.success('AI suggestions applied!');
  };

  const handleRewrite = () => {
    const rw = rewriteDescription(form.description);
    setAiSuggestions(s => ({ ...s, rewrite: rw }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.urgency) e.urgency = 'Urgency is required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await createRequest(form);
      toast.success('Request published!');
      navigate(`/requests/${res.data._id}`);
    } catch { toast.error('Failed to create request'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">CREATE REQUEST</p>
        <h1 className="text-4xl font-black mb-2">Turn a rough problem into a clear help request.</h1>
        <p className="text-gray-400 text-sm">Use built-in AI suggestions for category, urgency, tags, and a stronger description rewrite.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Need review on my JavaScript quiz app before submission" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
              placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          {aiSuggestions.rewrite && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-teal-700 mb-1">AI Rewrite Suggestion:</p>
              <p className="text-xs text-teal-800">{aiSuggestions.rewrite}</p>
              <button onClick={() => setForm({ ...form, description: aiSuggestions.rewrite })}
                className="text-xs text-teal-600 font-medium mt-1 hover:underline">Apply rewrite</button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="JavaScript, Debugging, Review" />
                <button onClick={addTag} className="px-3 py-2 rounded-lg text-sm text-white" style={{ background: '#0d9488' }}>+</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {form.tags.map(t => <SkillChip key={t} label={t} onDismiss={l => setForm({ ...form, tags: form.tags.filter(x => x !== l) })} />)}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="Karachi, Remote..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={applyAI} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50">
              Apply AI suggestions
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#0d9488' }}>
              {loading ? 'Publishing...' : 'Publish request'}
            </button>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">AI ASSISTANT</p>
          <h3 className="text-xl font-black text-gray-900 mb-5">Smart request guidance</h3>
          <div className="space-y-3">
            {[
              { label: 'Suggested category', value: aiSuggestions.category || 'Community' },
              { label: 'Detected urgency', value: aiSuggestions.urgency || 'Low' },
              { label: 'Suggested tags', value: aiSuggestions.tags.length ? aiSuggestions.tags.join(', ') : 'Add more detail for smarter tags' },
              { label: 'Rewrite suggestion', value: form.description.length > 10 ? 'Click below to generate' : 'Start describing the challenge to generate a stronger version.' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800 text-right max-w-[60%]">{item.value}</span>
              </div>
            ))}
          </div>
          {form.description.length > 10 && (
            <button onClick={handleRewrite} className="mt-4 w-full py-2 rounded-lg text-xs font-medium border border-teal-200 text-teal-600 hover:bg-teal-50">
              Generate rewrite suggestion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
