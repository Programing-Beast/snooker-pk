export default function DrawModeCard({ selected, onClick, icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-lg border-2 transition ${
        selected
          ? 'border-felt bg-felt-50'
          : 'border-hairline bg-white hover:border-ink-300'
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={`w-9 h-9 rounded-md grid place-items-center ${
            selected ? 'bg-felt text-white' : 'bg-surface2 text-ink-500'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            {icon}
          </svg>
        </span>
        <span className="font-display font-bold text-[15px]">{title}</span>
        <span
          className={`ml-auto w-5 h-5 rounded-full border-2 grid place-items-center ${
            selected ? 'border-felt bg-felt' : 'border-ink-300'
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-white" />}
        </span>
      </div>
      <p className="text-[12.5px] text-ink-500 leading-snug">{description}</p>
    </button>
  );
}
