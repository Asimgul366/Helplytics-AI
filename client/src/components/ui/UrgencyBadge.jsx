export default function UrgencyBadge({ level }) {
  const styles = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[level] || styles.Low}`}>
      {level}
    </span>
  );
}
