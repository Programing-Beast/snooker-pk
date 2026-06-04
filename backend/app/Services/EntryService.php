<?php

namespace App\Services;

use App\Models\Player;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class EntryService
{
    public function requestEntry(Player $player, int $tournamentId): TournamentEntry
    {
        $tournament = Tournament::findOrFail($tournamentId);

        if ($tournament->entry_status !== 'open') {
            throw ValidationException::withMessages([
                'tournament' => ['Entries are closed for this tournament.'],
            ]);
        }

        $existing = TournamentEntry::where('tournament_id', $tournamentId)
            ->where('player_id', $player->id)
            ->whereNull('deleted_at')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'player' => ['You have already requested entry to this tournament.'],
            ]);
        }

        if ($tournament->max_players) {
            $approvedCount = $tournament->approvedEntries()->count();
            if ($approvedCount >= $tournament->max_players) {
                throw ValidationException::withMessages([
                    'tournament' => ['This tournament has reached its maximum player capacity.'],
                ]);
            }
        }

        return TournamentEntry::create([
            'tournament_id' => $tournamentId,
            'player_id' => $player->id,
            'status' => 'pending',
            'source' => 'self_request',
            'requested_at' => now(),
        ]);
    }

    public function approve(TournamentEntry $entry, User $decidedBy): TournamentEntry
    {
        $entry->update([
            'status' => 'approved',
            'decided_at' => now(),
            'decided_by' => $decidedBy->id,
        ]);

        return $entry->fresh()->load('player');
    }

    public function reject(TournamentEntry $entry, User $decidedBy): TournamentEntry
    {
        $entry->update([
            'status' => 'rejected',
            'decided_at' => now(),
            'decided_by' => $decidedBy->id,
        ]);

        return $entry->fresh()->load('player');
    }

    public function adminAdd(int $tournamentId, int $playerId, User $decidedBy): TournamentEntry
    {
        $existing = TournamentEntry::where('tournament_id', $tournamentId)
            ->where('player_id', $playerId)
            ->whereNull('deleted_at')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'player' => ['This player already has an entry for this tournament.'],
            ]);
        }

        return TournamentEntry::create([
            'tournament_id' => $tournamentId,
            'player_id' => $playerId,
            'status' => 'approved',
            'source' => 'admin_added',
            'requested_at' => now(),
            'decided_at' => now(),
            'decided_by' => $decidedBy->id,
        ]);
    }

    public function setSeed(TournamentEntry $entry, ?int $seed): TournamentEntry
    {
        $entry->update(['seed' => $seed]);

        return $entry->fresh();
    }

    public function myEntries(Player $player): Collection
    {
        return TournamentEntry::where('player_id', $player->id)
            ->with('tournament')
            ->orderByDesc('created_at')
            ->get();
    }

    public function summary(Tournament $tournament, array $filters): LengthAwarePaginator
    {
        $query = $tournament->entries()->with('player');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 25);
    }
}
