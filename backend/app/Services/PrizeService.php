<?php

namespace App\Services;

use App\Models\Prize;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Collection;

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
        $prize->delete();
    }
}
