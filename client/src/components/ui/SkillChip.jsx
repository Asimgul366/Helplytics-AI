export default function SkillChip({ label, onDismiss }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      {label}
      {onDismiss && (
        <button onClick={() => onDismiss(label)} className="ml-0.5 text-gray-400 hover:text-gray-600 leading-none">×</button>
      )}
    </span>
  );
}
