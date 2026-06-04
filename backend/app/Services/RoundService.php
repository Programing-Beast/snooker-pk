<?php

namespace App\Services;

use App\Models\Round;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Collection;

class RoundService
{
    public function list(Tournament $tournament): Collection
    {
        return $tournament->rounds;
    }

    public function store(Tournament $tournament, array $data): Round
    {
        return $tournament->rounds()->create($data);
    }

    public function update(Round $round, array $data): Round
    {
        $round->update($data);

        return $round->fresh();
    }

    public function delete(Round $round): void
    {
        $round->delete();
    }
}
