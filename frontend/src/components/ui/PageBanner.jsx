const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage';

/**
 * Reusable green felt-gradient page banner.
 *
 * Props:
 *   children   — banner content
 *   bannerPath — optional image path (shown at 30% opacity behind content)
 */
export default function PageBanner({ children, bannerPath }) {
  const bannerUrl = bannerPath
    ? (bannerPath.startsWith('http') || bannerPath.startsWith('/') ? bannerPath : `${STORAGE_URL}/${bannerPath}`)
    : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-felt-400 to-felt-900">
      {bannerUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
      )}
      <div className="absolute inset-0 felt-grain opacity-30 mix-blend-overlay" />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
