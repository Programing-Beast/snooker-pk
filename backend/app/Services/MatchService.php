<?php

namespace App\Services;

use App\Events\MatchCompleted;
use App\Models\Break_;
use App\Models\Frame;
use App\Models\Match_;
use App\Models\Prize;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class MatchService
{
    public function __construct(private PrizeAwardService $prizeAwardService) {}
    public function umpireMatches(int $userId): Collection
    {
        return Match_::where('umpire_id', $userId)
            ->with(['player1', 'player2', 'tournament', 'round'])
            ->orderByRaw("CASE status WHEN 'live' THEN 0 WHEN 'scheduled' THEN 1 ELSE 2 END")
            ->orderBy('scheduled_at')
            ->get();
    }

    public function show(Match_ $match): Match_
    {
        return $match->load([
            'player1', 'player2', 'winner', 'umpire',
            'tournament', 'round', 'frames.breaks.player',
        ]);
    }

    public function update(Match_ $match, array $data): Match_
    {
        $match->update($data);

        return $match->fresh();
    }

    public function assignUmpire(Match_ $match, int $umpireId): Match_
    {
        $match->update(['umpire_id' => $umpireId]);

        return $match->fresh()->load('umpire');
    }

    public function walkover(Match_ $match, int $winnerId): Match_
    {
        if (! in_array($winnerId, [$match->player1_id, $match->player2_id])) {
            throw ValidationException::withMessages([
                'winner_id' => ['Winner must be one of the match players.'],
            ]);
        }

        $match->update([
            'winner_id' => $winnerId,
            'status' => 'walkover',
        ]);

        event(new MatchCompleted($match->fresh()));

        return $match->fresh()->load(['player1', 'player2', 'winner']);
    }

    public function complete(Match_ $match): Match_
    {
        $framesToWin = $match->round->frames_to_win;
        $score1 = $match->score1;
        $score2 = $match->score2;

        if ($score1 < $framesToWin && $score2 < $framesToWin) {
            throw ValidationException::withMessages([
                'match' => ["Neither player has won enough frames. Need {$framesToWin} to win."],
            ]);
        }

        $winnerId = $score1 >= $framesToWin ? $match->player1_id : $match->player2_id;

        $match->update([
            'winner_id' => $winnerId,
            'status' => 'completed',
        ]);

        event(new MatchCompleted($match->fresh()));

        return $match->fresh()->load(['player1', 'player2', 'winner']);
    }

    public function declareWinner(Match_ $match, int $winnerId, ?int $score1 = null, ?int $score2 = null): Match_
    {
        if (! in_array($winnerId, [$match->player1_id, $match->player2_id])) {
            throw ValidationException::withMessages([
                'winner_id' => ['Winner must be one of the match players.'],
            ]);
        }

        $data = [
            'winner_id' => $winnerId,
            'status' => 'completed',
        ];

        if (! is_null($score1)) {
            $data['score1'] = $score1;
        }
        if (! is_null($score2)) {
            $data['score2'] = $score2;
        }

        $match->update($data);

        event(new MatchCompleted($match->fresh()));

        return $match->fresh()->load(['player1', 'player2', 'winner']);
    }

    public function board(Match_ $match): Match_
    {
        return $match->load([
            'player1', 'player2', 'round',
            'frames' => fn ($q) => $q->orderBy('frame_no'),
            'frames.breaks' => fn ($q) => $q->orderBy('sort_order'),
            'frames.breaks.player',
        ]);
    }

    public function createFrame(Match_ $match, array $data): Frame
    {
        $data['match_id'] = $match->id;

        if (empty($data['frame_no'])) {
            $data['frame_no'] = $match->current_frame_no;
        }

        $frame = Frame::firstOrCreate(
            ['match_id' => $data['match_id'], 'frame_no' => $data['frame_no']],
            $data,
        );

        return $frame;
    }

    public function updateFrame(Frame $frame, array $data): Frame
    {
        $frame->update($data);

        // If frame is completed, recalculate match scores
        if (($data['status'] ?? null) === 'completed' && $frame->winner_id) {
            $this->recalculateMatchScores($frame->match);
        }

        return $frame->fresh()->load('breaks');
    }

    public function createBreak(Frame $frame, array $data): Break_
    {
        $data['frame_id'] = $frame->id;

        if (empty($data['sort_order'])) {
            $maxOrder = $frame->breaks()->max('sort_order') ?? 0;
            $data['sort_order'] = $maxOrder + 1;
        }

        $break = Break_::create($data);

        $this->recalculateFrameScores($frame);

        $this->checkScoreBasedPrizes($frame->match, $break);

        return $break->load('player');
    }

    public function updateBreak(Break_ $break, array $data): Break_
    {
        $break->update($data);

        $this->recalculateFrameScores($break->frame);

        return $break->fresh()->load('player');
    }

    public function deleteBreak(Break_ $break): void
    {
        $frame = $break->frame;
        $break->delete();

        $this->recalculateFrameScores($frame);
    }

    private function recalculateFrameScores(Frame $frame): void
    {
        $frame = $frame->fresh();
        $match = $frame->match;

        $breaks = $frame->breaks()->get();

        $score1 = 0;
        $score2 = 0;
        $highBreakValue = 0;
        $highBreakPlayerId = null;

        foreach ($breaks as $break) {
            if ($break->player_id === $match->player1_id) {
                $score1 += $break->points;
                // Add foul points to opponent
                $score2 += $break->foul_points;
            } else {
                $score2 += $break->points;
                // Add foul points to opponent
                $score1 += $break->foul_points;
            }

            if ($break->points > $highBreakValue && ! $break->is_foul_turn) {
                $highBreakValue = $break->points;
                $highBreakPlayerId = $break->player_id;
            }
        }

        $frame->update([
            'score1' => $score1,
            'score2' => $score2,
            'high_break_value' => $highBreakValue ?: null,
            'high_break_player_id' => $highBreakPlayerId,
        ]);
    }

    private function recalculateMatchScores(Match_ $match): void
    {
        $match = $match->fresh();

        $score1 = $match->frames()->where('winner_id', $match->player1_id)->count();
        $score2 = $match->frames()->where('winner_id', $match->player2_id)->count();

        $data = [
            'score1' => $score1,
            'score2' => $score2,
            'current_frame_no' => $score1 + $score2 + 1,
        ];

        // Auto-complete match when a player reaches the winning threshold
        $framesToWin = $match->round->frames_to_win;
        if ($match->status !== 'completed' && ($score1 >= $framesToWin || $score2 >= $framesToWin)) {
            $data['status'] = 'completed';
            $data['winner_id'] = $score1 >= $framesToWin ? $match->player1_id : $match->player2_id;
        }

        $match->update($data);

        if (isset($data['winner_id'])) {
            event(new \App\Events\MatchCompleted($match->fresh()));
        }
    }

    private function checkScoreBasedPrizes(Match_ $match, Break_ $break): void
    {
        if ($break->points <= 0 || $break->is_foul_turn) {
            return;
        }

        $match = $match->fresh();
        $player = $break->player;

        $scorePrizes = Prize::where('tournament_id', $match->tournament_id)
            ->whereNotNull('score_threshold')
            ->where('score_threshold', '<=', $break->points)
            ->get();

        foreach ($scorePrizes as $prize) {
            // If prize is not multiple, check if already awarded for this tournament+player
            if (! $prize->multiple) {
                $exists = \App\Models\PrizeAward::where('tournament_id', $match->tournament_id)
                    ->where('player_id', $player->id)
                    ->where('prize_id', $prize->id)
                    ->exists();

                if ($exists) {
                    continue;
                }
            }

            $this->prizeAwardService->createScorePrizeAward($match, $player, $prize);
        }
    }
}
