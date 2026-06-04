<?php

namespace App\Services;

use App\Models\Player;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RankingService
{
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

    public function manualAdjust(int $playerId, int $points, string $reason): Player
    {
        $player = Player::findOrFail($playerId);

        $player->update([
            'ranking_points' => $player->ranking_points + $points,
        ]);

        return $player->fresh();
    }
}
