export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div>
      {label && <label className="lbl">{label}</label>}
      <div className="relative">
        <select className={`input appearance-none pr-9 ${error ? 'input-error' : ''} ${className}`} {...props}>
          {children}
        </select>
        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 1l5 5 5-5" />
        </svg>
      </div>
      {error && <p className="text-[0.72rem] text-bad mt-1.5">{error}</p>}
    </div>
  );
}
