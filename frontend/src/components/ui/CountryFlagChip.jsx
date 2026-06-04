import pakFlag from '../../assets/flags/PAK.png';

const FLAGS = { PAK: pakFlag };
const LABEL = { PAK: 'Pakistan' };

export default function CountryFlagChip({ code = 'PAK', showLabel = true, size = 'default' }) {
  const dim = size === 'sm' ? 'w-4 h-[11px]' : 'w-[22px] h-[15px]';
  const src = FLAGS[code];

  return (
    <span className="inline-flex items-center gap-1.5">
      {src ? (
        <img src={src} alt={code} className={`${dim} rounded-[2px] object-cover shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]`} />
      ) : (
        <span className={`${dim} rounded-[2px] bg-ink-200 shrink-0`} />
      )}
      {showLabel && <span className="text-[12.5px] font-semibold">{LABEL[code] || code}</span>}
    </span>
  );
}
