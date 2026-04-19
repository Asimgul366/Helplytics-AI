const BADGE_CONFIG = {
  'first-helper': { label: 'First Helper', color: 'bg-blue-100 text-blue-700' },
  'rising-star': { label: 'Rising Star', color: 'bg-purple-100 text-purple-700' },
  'community-champion': { label: 'Community Champion', color: 'bg-amber-100 text-amber-700' },
  'legend': { label: 'Legend', color: 'bg-red-100 text-red-700' },
};

export default function Badge({ type }) {
  const config = BADGE_CONFIG[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
