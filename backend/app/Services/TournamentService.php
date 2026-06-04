<?php

namespace App\Services;

use App\Models\Tournament;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class TournamentService
{
    public function list(array $filters): LengthAwarePaginator
    {
        $query = Tournament::query();

        if (! empty($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $sortBy = $filters['sort_by'] ?? 'start_date';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        return $query->orderBy($sortBy, $sortDir)
            ->paginate($filters['per_page'] ?? 15);
    }

    public function showBySlug(string $slug): Tournament
    {
        $query = Tournament::with(['prizes', 'organizers.user.player.phones', 'rounds', 'winner', 'runnerUp']);

        if (ctype_digit($slug)) {
            return $query->findOrFail($slug);
        }

        return $query->where('slug', $slug)->firstOrFail();
    }

    public function create(array $data): Tournament
    {
        if (isset($data['banner']) && $data['banner'] instanceof UploadedFile) {
            $data['banner_path'] = $data['banner']->store('tournaments/banners', 'public');
            unset($data['banner']);
        }

        return Tournament::create($data);
    }

    public function update(Tournament $tournament, array $data): Tournament
    {
        if (isset($data['banner']) && $data['banner'] instanceof UploadedFile) {
            if ($tournament->banner_path) {
                Storage::disk('public')->delete($tournament->banner_path);
            }
            $data['banner_path'] = $data['banner']->store('tournaments/banners', 'public');
            unset($data['banner']);
        }

        $tournament->update($data);

        return $tournament->fresh();
    }

    public function delete(Tournament $tournament): void
    {
        $tournament->delete();
    }

    public function draw(Tournament $tournament): array
    {
        $rounds = $tournament->rounds()->with(['matches.player1', 'matches.player2', 'matches.winner'])->get();

        return $rounds->toArray();
    }

    public function players(Tournament $tournament): \Illuminate\Support\Collection
    {
        return $tournament->approvedEntries()->with('player')->orderBy('seed')->get();
    }

    public function updateEntryStatus(Tournament $tournament, string $status): Tournament
    {
        $tournament->update(['entry_status' => $status]);

        return $tournament->fresh();
    }

    public function updateMaxPlayers(Tournament $tournament, int $maxPlayers): Tournament
    {
        $tournament->update(['max_players' => $maxPlayers]);

        return $tournament->fresh();
    }
}
