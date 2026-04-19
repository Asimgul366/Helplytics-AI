import { useEffect, useState } from 'react';
import { getThreads, getMessages, sendMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getThreads().then(r => setThreads(r.data)).catch(() => {});
  }, []);

  const openThread = async (thread) => {
    setActiveThread(thread);
    try {
      const res = await getMessages(thread.request._id);
      setMessages(res.data);
    } catch {}
  };

  const handleSend = async () => {
    if (!content.trim()) { toast.error('Message cannot be empty'); return; }
    setSending(true);
    try {
      const res = await sendMessage(activeThread.request._id, content);
      setMessages(m => [...m, res.data]);
      setContent('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <Navbar />
      <div className="rounded-2xl mx-6 mt-6 p-8 text-white" style={{ background: '#1a2e2a' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">INTERACTION / MESSAGING</p>
        <h1 className="text-4xl font-black mb-2">Keep support moving through direct communication.</h1>
        <p className="text-gray-400 text-sm">Basic messaging gives helpers and requesters a clear follow-up path once a match happens.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Threads */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">CONVERSATION STREAM</p>
          <h2 className="text-xl font-black text-gray-900 mb-4">Recent messages</h2>
          <div className="space-y-3">
            {threads.map((t, i) => (
              <div key={i} onClick={() => openThread(t)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${activeThread?.request._id === t.request._id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'}`}>
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  {t.lastMessage?.sender?.name} → {t.request.owner?.name}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{t.lastMessage?.content}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(t.lastMessage?.createdAt)}</p>
              </div>
            ))}
            {threads.length === 0 && <p className="text-xs text-gray-400">No conversations yet.</p>}
          </div>
        </div>

        {/* Message Panel */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">SEND MESSAGE</p>
          <h2 className="text-xl font-black text-gray-900 mb-4">
            {activeThread ? `Thread: ${activeThread.request.title}` : 'Start a conversation'}
          </h2>

          {activeThread ? (
            <>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.map(m => (
                  <div key={m._id} className={`flex gap-3 ${m.sender?._id === user?._id ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#0d9488' }}>
                      {m.sender?.name?.[0]}
                    </div>
                    <div className={`max-w-xs ${m.sender?._id === user?._id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <p className="text-xs text-gray-400 mb-1">{m.sender?.name} • {formatTime(m.createdAt)}</p>
                      <div className={`px-3 py-2 rounded-xl text-sm ${m.sender?._id === user?._id ? 'text-white' : 'bg-gray-100 text-gray-800'}`}
                        style={m.sender?._id === user?._id ? { background: '#0d9488' } : {}}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none mb-3"
                placeholder="Share support details, ask for files, or suggest next steps." />
              <button onClick={handleSend} disabled={sending}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: '#0d9488' }}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {threads.map((t, i) => <option key={i}>{t.request.owner?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Message</label>
                <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Share support details, ask for files, or suggest next steps." />
              </div>
              <p className="text-xs text-gray-400">Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
