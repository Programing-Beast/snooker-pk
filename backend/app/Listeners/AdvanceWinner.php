<?php

namespace App\Listeners;

use App\Events\MatchCompleted;
use App\Models\Match_;
class AdvanceWinner
{
    public function handle(MatchCompleted $event): void
    {
        $match = $event->match;

        if (! $match->winner_id) {
            return;
        }

        $tournament = $match->tournament;
        $rounds = $tournament->rounds()->orderBy('sort_order')->get();
        $currentRoundIndex = $rounds->search(fn ($r) => $r->id === $match->round_id);

        if ($currentRoundIndex === false) {
            return;
        }

        // Final round — leave to CompleteTournament listener
        if ($currentRoundIndex >= $rounds->count() - 1) {
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

            // Auto-set generated_at once all match slots in the next round are filled
            if (! $nextRound->generated_at) {
                $allFilled = ! Match_::where('tournament_id', $tournament->id)
                    ->where('round_id', $nextRound->id)
                    ->where(fn ($q) => $q->whereNull('player1_id')->orWhereNull('player2_id'))
                    ->exists();

                if ($allFilled) {
                    $nextRound->update(['generated_at' => now()]);
                }
            }
        }
    }
}
