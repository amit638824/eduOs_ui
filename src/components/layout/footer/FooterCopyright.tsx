export default function FooterCopyright() {
  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-4 mt-5 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)', fontSize: '0.825rem', color: '#64748b' }}>
      <div>
        &copy; {new Date().getFullYear()} MindSprint. All rights reserved.
      </div>
      <div style={{ color: '#94a3b8', fontWeight: 600 }}>
        Learn &bull; Practice &bull; Succeed
      </div>
    </div>
  );
}
