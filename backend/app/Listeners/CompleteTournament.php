<?php

namespace App\Listeners;

use App\Events\MatchCompleted;
use App\Services\PrizeAwardService;

class CompleteTournament
{
    public function __construct(private PrizeAwardService $prizeAwardService) {}

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

        // Award ranking points via ledger
        $this->prizeAwardService->awardTournamentCompletion($match);
        $this->prizeAwardService->awardEliminationPrize($match, $loserId);
    }
}
