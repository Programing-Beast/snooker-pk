import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as matchesApi from '../../api/matches';
import * as framesApi from '../../api/frames';
import * as breaksApi from '../../api/breaks';
import UmpireBoard from '../../components/umpire/UmpireBoard';

export default function UmpireBoardPage() {
  const { matchId } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFrameId, setCurrentFrameId] = useState(null);

  // Refs so callbacks always read the latest values — no stale closures
  const frameIdRef = useRef(currentFrameId);
  frameIdRef.current = currentFrameId;
  const boardDataRef = useRef(boardData);
  boardDataRef.current = boardData;

  // Load match board data and initialise frame
  useEffect(() => {
    matchesApi.board(matchId)
      .then(async (res) => {
        const data = res.data.data ?? res.data;
        setBoardData(data);

        // Find an active frame or use the last one from the frames array
        const frames = data.frames ?? [];
        const activeFrame = frames.find(f => f.status === 'in_progress')
          || frames[frames.length - 1];

        if (activeFrame?.id) {
          setCurrentFrameId(activeFrame.id);
          frameIdRef.current = activeFrame.id;
        } else {
          // No frames yet — create the first one
          try {
            const frameRes = await framesApi.create(matchId, { frame_no: 1 });
            const newId = frameRes.data.data?.id ?? frameRes.data?.id;
            setCurrentFrameId(newId);
            frameIdRef.current = newId;
          } catch { /* continue without frame tracking */ }
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load match'))
      .finally(() => setLoading(false));
  }, [matchId]);

  // Build config for UmpireBoard from API data
  const ftw = boardData?.round?.frames_to_win;
  const allFrames = boardData?.frames ?? [];
  const completedFrames = allFrames.filter(f => f.status === 'completed');
  const activeFrame = allFrames.find(f => f.status === 'in_progress') || allFrames[allFrames.length - 1];
  const activeBreaks = (activeFrame && activeFrame.status !== 'completed')
    ? (activeFrame.breaks || [])
    : [];

  // Build resumeBreaks: ordered turns from the current in-progress frame
  const p1Id = boardData?.player1?.id;
  const resumeBreaks = activeBreaks.map(b => ({
    playerIndex: b.player_id === p1Id ? 0 : 1,
    points: b.points || 0,
    balls: b.balls || [],
    isFoul: b.is_foul_turn || false,
    foulPoints: b.foul_points || 0,
  }));

  const config = boardData ? {
    players: [
      {
        id: boardData.player1?.id,
        name: boardData.player1?.name || 'Player 1',
        countryCode: boardData.player1?.country_code || 'PAK',
        tier: boardData.player1?.tier || 'Amateur',
        seed: boardData.player1?.seed || null,
        frames: boardData.score1 || 0,
      },
      {
        id: boardData.player2?.id,
        name: boardData.player2?.name || 'Player 2',
        countryCode: boardData.player2?.country_code || 'PAK',
        tier: boardData.player2?.tier || 'Amateur',
        seed: boardData.player2?.seed || null,
        frames: boardData.score2 || 0,
      },
    ],
    bestOf: ftw ? (ftw * 2 - 1) : 9,
    tournament: boardData.tournament?.name || '',
    round: boardData.round?.name || '',
    frameNo: (boardData.current_frame_no ?? completedFrames.length + 1),
    frameHistory: completedFrames.map(f => ({
      p1Score: f.score1 || 0,
      p2Score: f.score2 || 0,
      winner: f.winner_id === boardData.player1?.id ? 0 : 1,
      topBreak: f.high_break_value || 0,
    })),
    resumeBreaks,
    redCount: boardData.round?.reds_count || 15,
  } : null;

  // Persist break to API on end turn / foul
  const handleEndTurn = useCallback(async (turnData) => {
    const frameId = frameIdRef.current;
    const bd = boardDataRef.current;
    if (!frameId || !bd) return;
    const { currentBreak, activePlayerIndex, isFoul, foulPoints } = turnData;
    if (!currentBreak.length && !isFoul) return;

    const players = [bd.player1, bd.player2];
    const playerId = players[activePlayerIndex]?.id;
    if (!playerId) return;

    try {
      await breaksApi.create(frameId, {
        player_id: playerId,
        points: currentBreak.reduce((s, v) => s + v, 0),
        balls: currentBreak,
        is_foul_turn: isFoul || false,
        foul_points: foulPoints || 0,
      });
    } catch { /* continue local scoring */ }
  }, []);

  // Persist frame end to API
  const handleFrameEnd = useCallback(async (frameData) => {
    const frameId = frameIdRef.current;
    const bd = boardDataRef.current;
    if (!frameId || !bd) return;
    const players = [bd.player1, bd.player2];
    const winnerId = players[frameData.winner]?.id;

    try {
      await framesApi.update(frameId, {
        winner_id: winnerId,
        status: 'completed',
      });
    } catch { /* continue */ }

    // Only create next frame if match isn't over
    if (!frameData.matchOver) {
      try {
        const res = await framesApi.create(matchId, {
          frame_no: frameData.frameNo + 1,
        });
        const newId = res.data.data?.id ?? res.data?.id;
        setCurrentFrameId(newId);
        frameIdRef.current = newId; // immediately available to other callbacks
      } catch { /* ignore */ }
    }
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

  // Render the existing UmpireBoard with config + persistence callbacks
  return (
    <div className="h-screen bg-night">
      <UmpireBoard
        config={config}
        onEndTurn={handleEndTurn}
        onFrameEnd={handleFrameEnd}
      />
    </div>
  );
}
