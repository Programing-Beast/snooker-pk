export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-hairline px-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-3.5 text-[13.5px] font-semibold border-b-2 transition ${
            active === tab.key
              ? 'border-felt text-felt'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
