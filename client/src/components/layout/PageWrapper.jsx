export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f0fdfa 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
