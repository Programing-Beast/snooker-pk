<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\TournamentOrganizer;
use Illuminate\Database\Eloquent\Collection;

class TournamentOrganizerService
{
    public function list(Tournament $tournament): Collection
    {
        return $tournament->organizers()->with(['user.player.phones'])->get();
    }

    public function store(Tournament $tournament, array $data): TournamentOrganizer
    {
        return $tournament->organizers()->create($data)->load(['user.player.phones']);
    }

    public function update(TournamentOrganizer $organizer, array $data): TournamentOrganizer
    {
        $organizer->update($data);

        return $organizer->fresh()->load(['user.player.phones']);
    }

    public function delete(TournamentOrganizer $organizer): void
    {
        $organizer->delete();
    }
}
