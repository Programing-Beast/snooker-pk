<?php

namespace App\Services;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Prize;
use App\Models\PrizeAward;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PrizeAwardService
{
    public function award(array $data): PrizeAward
    {
        $data['status'] = $data['status'] ?? PrizeAward::STATUS_AWARDED;

        if (! isset($data['awarded_at']) && $data['status'] === PrizeAward::STATUS_AWARDED) {
            $data['awarded_at'] = now();
        }

        $award = PrizeAward::create($data);

        if ($award->is_ranking && $award->status === PrizeAward::STATUS_AWARDED) {
            Player::find($award->player_id)->recalculateRankingPoints();
        }

        return $award;
    }

    public function awardTournamentCompletion(Match_ $match): void
    {
        $tournament = $match->tournament;
        $prizes = $tournament->prizes()->get();

        $winnerPrize = $prizes->first(fn ($p) => $p->type === Prize::TYPE_WINNER);
        $runnerUpPrize = $prizes->first(fn ($p) => $p->type === Prize::TYPE_RUNNER_UP);

        $loserId = $match->winner_id === $match->player1_id
            ? $match->player2_id
            : $match->player1_id;

        if ($winnerPrize && $winnerPrize->amount > 0) {
            $this->award([
                'tournament_id' => $tournament->id,
                'match_id' => $match->id,
                'player_id' => $match->winner_id,
                'prize_id' => $winnerPrize->id,
                'amount' => $winnerPrize->amount,
                'is_ranking' => $winnerPrize->ranking_prize,
                'category' => PrizeAward::CATEGORY_TOURNAMENT_WINNER,
                'status' => PrizeAward::STATUS_PENDING,
            ]);
        }

        if ($runnerUpPrize && $runnerUpPrize->amount > 0 && $loserId) {
            $this->award([
                'tournament_id' => $tournament->id,
                'match_id' => $match->id,
                'player_id' => $loserId,
                'prize_id' => $runnerUpPrize->id,
                'amount' => $runnerUpPrize->amount,
                'is_ranking' => $runnerUpPrize->ranking_prize,
                'category' => PrizeAward::CATEGORY_TOURNAMENT_RUNNER_UP,
                'status' => PrizeAward::STATUS_PENDING,
            ]);
        }
    }

    public function awardEliminationPrize(Match_ $match, int $loserId): void
    {
        $round = $match->round;

        if (! $round || ! $round->elimination_prize || $round->elimination_prize <= 0) {
            return;
        }

        $this->award([
            'tournament_id' => $match->tournament_id,
            'match_id' => $match->id,
            'round_id' => $round->id,
            'player_id' => $loserId,
            'amount' => $round->elimination_prize,
            'is_ranking' => true,
            'category' => PrizeAward::CATEGORY_ROUND_ELIMINATION,
            'status' => PrizeAward::STATUS_AWARDED,
        ]);
    }

    public function createScorePrizeAward(Match_ $match, Player $player, Prize $prize): void
    {
        $this->award([
            'tournament_id' => $match->tournament_id,
            'match_id' => $match->id,
            'player_id' => $player->id,
            'prize_id' => $prize->id,
            'amount' => $prize->amount,
            'is_ranking' => $prize->ranking_prize,
            'category' => PrizeAward::CATEGORY_SCORE_PRIZE,
            'status' => PrizeAward::STATUS_PENDING,
        ]);
    }

    public function bulkAward(int $tournamentId, int $prizeId, array $playerIds, ?int $awardedBy): void
    {
        $prize = Prize::findOrFail($prizeId);

        foreach ($playerIds as $playerId) {
            $this->award([
                'tournament_id' => $tournamentId,
                'player_id' => $playerId,
                'prize_id' => $prizeId,
                'amount' => $prize->amount,
                'is_ranking' => $prize->ranking_prize,
                'category' => PrizeAward::CATEGORY_CUSTOM,
                'status' => PrizeAward::STATUS_AWARDED,
                'awarded_by' => $awardedBy,
            ]);
        }
    }

    public function confirmAward(PrizeAward $award, User $confirmedBy): PrizeAward
    {
        $award->update([
            'status' => PrizeAward::STATUS_AWARDED,
            'awarded_by' => $confirmedBy->id,
            'awarded_at' => now(),
        ]);

        if ($award->is_ranking) {
            $award->player->recalculateRankingPoints();
        }

        return $award->fresh();
    }

    public function manualAdjust(int $playerId, int $points, string $reason, ?int $tournamentId = null, ?int $awardedBy = null): PrizeAward
    {
        return $this->award([
            'tournament_id' => $tournamentId,
            'player_id' => $playerId,
            'amount' => $points,
            'is_ranking' => true,
            'category' => PrizeAward::CATEGORY_MANUAL_ADJUSTMENT,
            'status' => PrizeAward::STATUS_AWARDED,
            'reason' => $reason,
            'awarded_by' => $awardedBy,
        ]);
    }

    public function listForTournament(int $tournamentId): Collection
    {
        return PrizeAward::where('tournament_id', $tournamentId)
            ->with(['player', 'prize', 'awardedBy'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function listForPlayer(int $playerId, array $filters = []): LengthAwarePaginator
    {
        $query = PrizeAward::where('player_id', $playerId)
            ->with(['tournament', 'prize', 'awardedBy']);

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 25);
    }

    public function getEligiblePlayers(int $tournamentId, bool $excludeQualifiers = false): Collection
    {
        $query = Player::whereHas('matchesAsPlayer1', fn ($q) => $q->where('tournament_id', $tournamentId))
            ->orWhereHas('matchesAsPlayer2', fn ($q) => $q->where('tournament_id', $tournamentId));

        if ($excludeQualifiers) {
            $firstRound = \App\Models\Round::where('tournament_id', $tournamentId)
                ->orderBy('sort_order')
                ->first();

            if ($firstRound) {
                // Exclude players who only appeared in the first round and lost
                $query->where(function ($q) use ($tournamentId, $firstRound) {
                    // Players who have matches beyond the first round
                    $q->whereHas('matchesAsPlayer1', fn ($mq) => $mq->where('tournament_id', $tournamentId)->where('round_id', '!=', $firstRound->id))
                        ->orWhereHas('matchesAsPlayer2', fn ($mq) => $mq->where('tournament_id', $tournamentId)->where('round_id', '!=', $firstRound->id));
                });
            }
        }

        return $query->get();
    }
}
