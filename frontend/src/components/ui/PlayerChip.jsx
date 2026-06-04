import PlayerAvatar from './PlayerAvatar';
import CountryFlagChip from './CountryFlagChip';

export default function PlayerChip({ player, size = 'default' }) {
  if (!player) return <span className="text-ink-400 italic text-[13px]">TBD</span>;

  const big = size === 'lg';

  return (
    <span className={`inline-flex items-center gap-1.5 ${big ? 'text-[14px]' : 'text-[12.5px]'}`}>
      <PlayerAvatar
        name={player.name}
        photo={player.photo}
        tier={player.tier}
        size="sm"
        className={`${big ? '!w-7 !h-7' : '!w-6 !h-6'} !text-[10px] ${player.seed === 1 ? 'ring-1 ring-brass' : ''}`}
      />
      <CountryFlagChip code={player.country_code || 'PAK'} showLabel={false} size="sm" />
      <span className="font-semibold">{player.name}</span>
      {player.seed != null && (
        <span className="text-[10px] text-ink-400 tabular-nums">{player.seed}</span>
      )}
    </span>
  );
}
