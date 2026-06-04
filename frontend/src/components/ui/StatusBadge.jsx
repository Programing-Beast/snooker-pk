const STYLES = {
  live: 'bg-live-fill text-white',
  upcoming: 'bg-brass-tint text-brass-700',
  completed: 'bg-ink-100 text-ink-600',
  pending: 'bg-warn-tint text-[#9A5B12]',
  approved: 'bg-ok-tint text-[#0C6B3C]',
  rejected: 'bg-bad-tint text-[#9A2820]',
  pro: 'bg-felt text-white',
  amateur: 'bg-white text-ink-800 border border-ink-300',
};

export default function StatusBadge({ status, pulse, children }) {
  const style = STYLES[status] || STYLES.completed;
  return (
    <span className={`badge ${style}`}>
      {(status === 'live' || pulse) && <span className="dot pulse" />}
      {!pulse && status !== 'live' && <span className="dot" />}
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
