import PlayerAvatar from './PlayerAvatar';
import CountryFlagChip from './CountryFlagChip';

const TIER_LABEL = { pro: 'Professional', amateur: 'Amateur' };

export default function PlayerListItem({ player, index, size = 'sm', showFlag = true, showTier = true, children }) {
  if (!player) return null;

  const tierLabel = TIER_LABEL[player.tier?.toLowerCase()] || player.tier;

  return (
    <div className="flex items-center gap-3">
      {index != null && (
        <span className="w-6 text-center text-[12px] text-ink-400 tabular-nums shrink-0">{index}</span>
      )}
      <PlayerAvatar name={player.name} photo={player.photo_path || player.photo} tier={player.tier} size={size} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold truncate">{player.name}</div>
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          {showFlag && <CountryFlagChip code={player.country_code || 'PAK'} size="sm" showLabel={false} />}
          {showTier && tierLabel && <span>{tierLabel}</span>}
          {player.city && <span>{player.city}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}
