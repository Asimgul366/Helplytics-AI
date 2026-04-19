import UrgencyBadge from './UrgencyBadge';
import SkillChip from './SkillChip';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RequestCard({ request, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">{request.category}</span>
        <UrgencyBadge level={request.urgency} />
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.status === 'solved' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {request.status === 'solved' ? 'Solved' : 'Open'}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-snug">{request.title}</h3>
      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{request.description}</p>
      {request.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {request.tags.slice(0, 4).map(tag => <SkillChip key={tag} label={tag} />)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-700">{request.owner?.name}</p>
          <p className="text-xs text-gray-400">
            {request.location || 'Remote'} • {request.helpers?.length || 0} helper{request.helpers?.length !== 1 ? 's' : ''} interested
          </p>
        </div>
        <span className="text-xs text-teal-600 font-medium hover:underline">Open details</span>
      </div>
    </div>
  );
}
