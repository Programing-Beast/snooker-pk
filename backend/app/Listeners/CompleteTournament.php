<?php

namespace App\Listeners;

use App\Events\MatchCompleted;
use App\Models\Player;
class CompleteTournament
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

        // Only act on the final round
        if ($currentRoundIndex < $rounds->count() - 1) {
            return;
        }

        $loserId = $match->winner_id === $match->player1_id
            ? $match->player2_id
            : $match->player1_id;

        $tournament->update([
            'winner_id' => $match->winner_id,
            'runner_up_id' => $loserId,
            'status' => 'completed',
        ]);

        // Award ranking points (= prize amount)
        $prizes = $tournament->prizes()->get();

        $winnerPrize = $prizes->first(fn ($p) => strcasecmp($p->position_label, 'Winner') === 0);
        $runnerUpPrize = $prizes->first(fn ($p) => strcasecmp($p->position_label, 'Runner-up') === 0);

        if ($winnerPrize && $winnerPrize->amount > 0) {
            Player::where('id', $match->winner_id)
                ->increment('ranking_points', (int) $winnerPrize->amount);
        }

        if ($runnerUpPrize && $runnerUpPrize->amount > 0 && $loserId) {
            Player::where('id', $loserId)
                ->increment('ranking_points', (int) $runnerUpPrize->amount);
        }
    }
}
