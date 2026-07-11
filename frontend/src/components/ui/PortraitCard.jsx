/**
 * Layered portrait card with gold/dark treatment.
 *
 * Three layers:
 *   1. Panel background — gold radial gradient (winner) or dark radial gradient (loser)
 *   2. Player image — full colour (winner) or desaturated+dimmed (loser)
 *   3. Soft bottom fade — melts the figure into the card bottom
 *
 * Props:
 *   src  — resolved photo URL
 *   alt  — player name
 *   won  — boolean, toggles gold vs dark treatment
 */
export default function PortraitCard({ src, alt, won, compact = false }) {
  const panelStyle = won
    ? {
        background:
          'radial-gradient(130% 100% at 50% 20%, #ffd24a, #f7b81e 55%, #e09a10)',
        boxShadow: '0 0 20px rgba(240,180,40,0.5), 0 12px 45px -8px rgba(240,180,40,0.55)',
      }
    : {
        background:
          'radial-gradient(130% 100% at 50% 10%, #232323, #161616 60%, #0d0d0d)',
        boxShadow: '0 12px 30px -14px rgba(0,0,0,0.85)',
      };

  const imgFilter = won ? undefined : 'grayscale(45%) brightness(0.8)';

  const fadeColor = won
    ? 'rgba(224,154,16,0.85)'
    : 'rgba(13,13,13,0.9)';

  return (
    <div
      className={`shrink-0 overflow-hidden relative ${compact ? 'w-14 h-[72px] rounded-lg' : 'w-24 h-32 sm:w-28 sm:h-36 rounded-xl'}`}
      style={panelStyle}
    >
      {/* Player image */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-top"
        style={imgFilter ? { filter: imgFilter } : undefined}
      />

      {/* Soft bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${fadeColor}, transparent)`,
        }}
      />
    </div>
  );
}
