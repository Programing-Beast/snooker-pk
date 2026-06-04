export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-surface2 grid place-items-center mx-auto mb-4 text-ink-300">
        {icon || (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" />
          </svg>
        )}
      </div>
      <h3 className="font-display font-bold text-[1.25rem]">{title || 'Nothing here yet'}</h3>
      {message && <p className="text-ink-500 text-[14px] max-w-xs mx-auto mt-1.5">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
