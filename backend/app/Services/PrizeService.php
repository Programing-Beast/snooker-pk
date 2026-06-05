<?php

namespace App\Services;

use App\Models\Prize;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class PrizeService
{
    public function list(Tournament $tournament): Collection
    {
        return $tournament->prizes;
    }

    public function store(Tournament $tournament, array $data): Prize
    {
        return $tournament->prizes()->create($data);
    }

    public function update(Prize $prize, array $data): Prize
    {
        $prize->update($data);

        return $prize->fresh();
    }

    public function delete(Prize $prize): void
    {
        if ($prize->isSystemPrize()) {
            throw ValidationException::withMessages([
                'prize' => ['System prizes (winner/runner-up) cannot be deleted.'],
            ]);
        }

        $prize->delete();
    }

    public function ensureSystemPrizes(Tournament $tournament): void
    {
        $prizes = $tournament->prizes()->get();

        // Check by type first, then fall back to position_label for pre-migration data
        $hasWinner = $prizes->contains(fn ($p) => $p->type === Prize::TYPE_WINNER)
            || $prizes->contains(fn ($p) => strcasecmp($p->position_label, 'Winner') === 0);
        $hasRunnerUp = $prizes->contains(fn ($p) => $p->type === Prize::TYPE_RUNNER_UP)
            || $prizes->contains(fn ($p) => strcasecmp($p->position_label, 'Runner-up') === 0);

        // Upgrade existing label-matched prizes to correct type
        $tournament->prizes()
            ->where('type', Prize::TYPE_CUSTOM)
            ->whereRaw('LOWER(position_label) = ?', ['winner'])
            ->update(['type' => Prize::TYPE_WINNER]);

        $tournament->prizes()
            ->where('type', Prize::TYPE_CUSTOM)
            ->whereRaw('LOWER(position_label) = ?', ['runner-up'])
            ->update(['type' => Prize::TYPE_RUNNER_UP]);

        if (! $hasWinner) {
            $tournament->prizes()->create([
                'position_label' => 'Winner',
                'type' => Prize::TYPE_WINNER,
                'amount' => 0,
                'sort_order' => 0,
                'ranking_prize' => true,
            ]);
        }

        if (! $hasRunnerUp) {
            $tournament->prizes()->create([
                'position_label' => 'Runner-up',
                'type' => Prize::TYPE_RUNNER_UP,
                'amount' => 0,
                'sort_order' => 1,
                'ranking_prize' => true,
            ]);
        }
    }
}
