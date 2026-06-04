import { Link } from 'react-router-dom';
import PlayerListItem from './PlayerListItem';

export default function RankingsRow({ rank, player }) {
  const movement = player.movement || '—';
  const movementColor = movement.includes('▲') ? 'text-ok' : movement.includes('▼') ? 'text-bad' : 'text-ink-400';

  return (
    <Link to={`/players/${player.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface2 transition">
      <PlayerListItem player={player} index={rank} showTier={false}>
        <div className="text-right">
          <div className="font-display font-bold tabular-nums text-[15px]">
            {Number(player.points || 0).toLocaleString()}
          </div>
          <div className={`text-[0.72rem] ${movementColor}`}>{movement}</div>
        </div>
      </PlayerListItem>
    </Link>
  );
}
