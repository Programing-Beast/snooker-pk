<?php

namespace App\Services;

use App\Models\Player;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RankingService
{
    public function __construct(private PrizeAwardService $prizeAwardService) {}

    public function list(array $filters): LengthAwarePaginator
    {
        $query = Player::where('status', 'active');

        if (! empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        return $query->orderByDesc('ranking_points')
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 25);
    }

    public function manualAdjust(int $playerId, int $points, string $reason, ?User $adjustedBy = null): Player
    {
        $this->prizeAwardService->manualAdjust(
            $playerId,
            $points,
            $reason,
            awardedBy: $adjustedBy?->id,
        );

        return Player::findOrFail($playerId);
    }
}
