import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as matchesApi from '../../api/matches';
import * as framesApi from '../../api/frames';
import * as breaksApi from '../../api/breaks';
import UmpireBoard from '../../components/umpire/UmpireBoard';
import { ACTIONS } from '../../engine/snookerEngine';
import useSnookerEngine from '../../hooks/useSnookerEngine';

export default function UmpireBoardPage() {
  const { matchId } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFrameId, setCurrentFrameId] = useState(null);

  // Load match board data
  useEffect(() => {
    matchesApi.board(matchId)
      .then(res => {
        const data = res.data.data ?? res.data;
        setBoardData(data);
        // If there's an active frame, track it
        if (data.current_frame?.id) {
          setCurrentFrameId(data.current_frame.id);
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load match'))
      .finally(() => setLoading(false));
  }, [matchId]);

  // Build config for UmpireBoard from API data
  const config = boardData ? {
    players: [
      {
        id: boardData.player1?.id,
        name: boardData.player1?.name || 'Player 1',
        countryCode: boardData.player1?.country_code || 'PAK',
        tier: boardData.player1?.tier || 'Amateur',
        seed: boardData.player1?.seed || null,
      },
      {
        id: boardData.player2?.id,
        name: boardData.player2?.name || 'Player 2',
        countryCode: boardData.player2?.country_code || 'PAK',
        tier: boardData.player2?.tier || 'Amateur',
        seed: boardData.player2?.seed || null,
      },
    ],
    bestOf: boardData.best_of || boardData.frames_to_win ? (boardData.frames_to_win * 2 - 1) : 9,
    tournament: boardData.tournament?.name || '',
    round: boardData.round?.name || '',
  } : null;

  // Persist break to API on end turn
  const handleEndTurn = useCallback(async (breakBalls, playerIndex) => {
    if (!currentFrameId || !breakBalls.length) return;
    try {
      await breaksApi.create(currentFrameId, {
        player_index: playerIndex,
        balls: breakBalls,
        total: breakBalls.reduce((s, v) => s + v, 0),
      });
    } catch { /* continue local scoring */ }
  }, [currentFrameId]);

  // Persist frame end to API
  const handleFrameEnd = useCallback(async (frameData) => {
    if (!currentFrameId) return;
    try {
      await framesApi.update(currentFrameId, {
        player1_score: frameData.p1Score,
        player2_score: frameData.p2Score,
        winner_index: frameData.winner,
        status: 'completed',
      });
      // Create next frame
      const res = await framesApi.create(matchId, {
        frame_number: frameData.frameNo + 1,
      });
      setCurrentFrameId(res.data.data?.id ?? res.data?.id);
    } catch { /* continue */ }
  }, [currentFrameId, matchId]);

  // Persist match end to API
  const handleMatchEnd = useCallback(async () => {
    try {
      await matchesApi.complete(matchId);
    } catch { /* ignore */ }
  }, [matchId]);

  if (loading) {
    return (
      <div className="h-screen bg-night grid place-items-center">
        <div className="text-center">
          <span className="font-display font-extrabold text-white uppercase tracking-tight text-xl">
            Snooker<span className="text-live">PK</span>
          </span>
          <p className="text-ink-400 text-[14px] mt-3">Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-night grid place-items-center">
        <div className="text-center">
          <span className="font-display font-extrabold text-white uppercase tracking-tight text-xl">
            Snooker<span className="text-live">PK</span>
          </span>
          <p className="text-bad text-[14px] mt-3">{error}</p>
        </div>
      </div>
    );
  }

  // Render the existing UmpireBoard with config from API
  return (
    <div className="h-screen bg-night">
      <UmpireBoard config={config} />
    </div>
  );
}
