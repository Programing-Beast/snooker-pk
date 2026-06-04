export default function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 text-[14px] cursor-pointer">
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-felt' : 'bg-ink-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-[left] ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      {label}
    </label>
  );
}
