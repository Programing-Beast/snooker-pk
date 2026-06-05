export default function RoundHeader({ name, subtitle, detail }) {
  return (
    <div className="dark-ctx px-[18px] py-3 bg-night text-white font-display font-semibold text-[12px] tracking-[0.12em] uppercase flex items-center gap-3">
      {name}
      {subtitle && <span className="text-muted font-medium normal-case tracking-normal">· {subtitle}</span>}
      {detail && <span className="ml-auto text-muted font-medium normal-case tracking-normal">{detail}</span>}
    </div>
  );
}
