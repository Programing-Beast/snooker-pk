import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="dark-ctx bg-night px-6 sm:px-9 py-8">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-display font-extrabold text-white uppercase tracking-tight">
            Snooker<span className="text-live">PK</span>
          </span>
          <p className="text-muted text-[12.5px] mt-1.5">Pakistan's first dedicated snooker platform.</p>
        </div>
        <div className="flex gap-7 text-[13px] text-body">
          <Link to="/tournaments" className="hover:text-heading">Tournaments</Link>
          <Link to="/rankings" className="hover:text-heading">Rankings</Link>
          <Link to="/store" className="hover:text-heading">Store</Link>
        </div>
      </div>
    </footer>
  );
}
