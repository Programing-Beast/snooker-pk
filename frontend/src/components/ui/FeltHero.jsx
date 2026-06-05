export default function FeltHero({ gradient, className, onFelt, children, as: Tag = 'header' }) {
  return (
    <Tag className={`dark-ctx relative overflow-hidden bg-night felt-grain${onFelt ? ' on-felt' : ''}`}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(${gradient}, transparent 60%)` }} />
      <div className={`relative${className ? ` ${className}` : ''}`}>
        {children}
      </div>
    </Tag>
  );
}
