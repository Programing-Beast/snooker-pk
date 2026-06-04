export default function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="lbl">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <p className="text-[0.72rem] text-bad mt-1.5">{error}</p>}
    </div>
  );
}
