import { Link } from 'react-router-dom';
import PlayerAvatar from './PlayerAvatar';
import CountryFlagChip from './CountryFlagChip';

export default function PlayerChip({ player, size = 'default', to }) {
  if (!player) return <span className="text-muted italic text-[13px]">TBD</span>;

  const big = size === 'lg';
  const Root = to ? Link : 'span';
  const rootProps = to ? { to } : {};

  return (
    <Root {...rootProps} className={`inline-flex items-center gap-1.5 ${big ? 'text-[14px]' : 'text-[12.5px]'}`}>
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
        <span className="text-[10px] text-muted tabular-nums">{player.seed}</span>
      )}
    </Root>
  );
}
