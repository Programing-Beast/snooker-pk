<?php

namespace App\Services;

use App\Models\Break_;
use App\Models\Frame;
use App\Models\Match_;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MatchService
{
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

        $this->advanceWinner($match->fresh());

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

        $this->advanceWinner($match->fresh());

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

        $this->advanceWinner($match->fresh());

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

        $frame = Frame::create($data);

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

        $match->update([
            'score1' => $score1,
            'score2' => $score2,
            'current_frame_no' => $score1 + $score2 + 1,
        ]);
    }

    private function advanceWinner(Match_ $match): void
    {
        if (! $match->winner_id) {
            return;
        }

        $tournament = $match->tournament;
        $rounds = $tournament->rounds()->orderBy('sort_order')->get();
        $currentRoundIndex = $rounds->search(fn ($r) => $r->id === $match->round_id);

        if ($currentRoundIndex === false || $currentRoundIndex >= $rounds->count() - 1) {
            return;
        }

        $nextRound = $rounds[$currentRoundIndex + 1];
        $nextPosition = intdiv($match->position - 1, 2) + 1;
        $isPlayer1 = ($match->position % 2) === 1;

        $nextMatch = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $nextRound->id)
            ->where('position', $nextPosition)
            ->first();

        if ($nextMatch) {
            $nextMatch->update([
                $isPlayer1 ? 'player1_id' : 'player2_id' => $match->winner_id,
            ]);
        }
    }
}
