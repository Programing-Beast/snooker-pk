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
        $tournament = Tournament::findOrFail($tournamentId);

        $existing = TournamentEntry::where('tournament_id', $tournamentId)
            ->where('player_id', $playerId)
            ->whereNull('deleted_at')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'player' => ['This player already has an entry for this tournament.'],
            ]);
        }

        if ($tournament->max_players) {
            $approvedCount = $tournament->approvedEntries()->count();
            if ($approvedCount >= $tournament->max_players) {
                throw ValidationException::withMessages([
                    'tournament' => ["This tournament has reached its maximum capacity of {$tournament->max_players} players."],
                ]);
            }
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

    public function bulkAdminAdd(int $tournamentId, array $playerIds, User $decidedBy): int
    {
        $tournament = Tournament::findOrFail($tournamentId);

        $existing = TournamentEntry::where('tournament_id', $tournamentId)
            ->whereIn('player_id', $playerIds)
            ->whereNull('deleted_at')
            ->pluck('player_id')
            ->toArray();

        $newIds = array_values(array_diff($playerIds, $existing));

        // Enforce max_players capacity
        if ($tournament->max_players) {
            $approvedCount = $tournament->approvedEntries()->count();
            $available = $tournament->max_players - $approvedCount;

            if ($available <= 0) {
                throw ValidationException::withMessages([
                    'tournament' => ["This tournament has reached its maximum capacity of {$tournament->max_players} players."],
                ]);
            }

            // Trim to available slots
            $newIds = array_slice($newIds, 0, $available);
        }

        if (empty($newIds)) {
            return 0;
        }

        $now = now();

        $rows = array_map(fn ($pid) => [
            'tournament_id' => $tournamentId,
            'player_id' => $pid,
            'status' => 'approved',
            'source' => 'admin_added',
            'requested_at' => $now,
            'decided_at' => $now,
            'decided_by' => $decidedBy->id,
            'created_at' => $now,
            'updated_at' => $now,
        ], $newIds);

        TournamentEntry::insert($rows);

        return count($newIds);
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
