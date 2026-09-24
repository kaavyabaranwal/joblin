const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  APPLIED: { label: 'Applied', dot: '#8b6dd6', bg: 'rgba(139, 109, 214, 0.12)', text: '#a88fd6', border: 'rgba(139, 109, 214, 0.25)' },
  INTERVIEWING: { label: 'Interviewing', dot: '#b59de8', bg: 'rgba(139, 109, 214, 0.22)', text: '#c9b3f0', border: 'rgba(139, 109, 214, 0.45)' },
  OFFER: { label: 'Offer', dot: '#4a7c5c', bg: 'rgba(74, 124, 92, 0.15)', text: '#6aad84', border: 'rgba(74, 124, 92, 0.35)' },
  REJECTED: { label: 'Rejected', dot: '#6b6575', bg: 'rgba(107, 101, 117, 0.12)', text: '#8a8395', border: 'rgba(107, 101, 117, 0.25)' },
  GHOSTED: { label: 'Ghosted', dot: '#4a4452', bg: 'rgba(74, 68, 82, 0.10)', text: '#6a6475', border: 'rgba(74, 68, 82, 0.20)' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.APPLIED;
  return (
    <span className="status-badge" style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.dot,
          display: 'inline-block', flexShrink: 0,
          boxShadow: status === 'INTERVIEWING' ? `0 0 6px ${cfg.dot}` : undefined,
        }}
      />
      {cfg.label}
    </span>
  );
}