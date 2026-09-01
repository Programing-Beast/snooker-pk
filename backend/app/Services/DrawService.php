<?php

namespace App\Services;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Round;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DrawService
{
    public function previewDraw(Tournament $tournament): array
    {
        $approvedEntries = $tournament->approvedEntries()->with('player')->get();
        $playerCount = $approvedEntries->count();

        if ($playerCount < 2) {
            throw ValidationException::withMessages([
                'tournament' => ['At least 2 approved players are required to generate a draw.'],
            ]);
        }

        $drawSize = $tournament->draw_size ?? $this->nextPowerOfTwo($playerCount);
        $byeCount = $drawSize - $playerCount;

        $seeded = $approvedEntries->whereNotNull('seed')->sortBy('seed')->values();
        $unseeded = $approvedEntries->whereNull('seed')->values();

        return [
            'player_count' => $playerCount,
            'draw_size' => $drawSize,
            'bye_count' => $byeCount,
            'seeded_players' => $seeded->map(fn ($e) => [
                'seed' => $e->seed,
                'player' => $e->player,
            ])->toArray(),
            'unseeded_count' => $unseeded->count(),
        ];
    }

    public function generateDraw(Tournament $tournament, ?Round $round = null, ?array $pairings = null): Tournament
    {
        // Auto-create main draw rounds (skip for qualifier rounds)
        if (! $round || ! $round->is_qualifier) {
            $this->ensureRoundsExist($tournament);
        }

        // Resolve to first round if not specified
        if (! $round) {
            $round = $tournament->rounds()->orderBy('sort_order')->first();
        }

        // Prevent regeneration when this round already has played matches
        $hasResults = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $round->id)
            ->whereIn('status', ['completed', 'walkover', 'live'])
            ->exists();

        if ($hasResults) {
            throw ValidationException::withMessages([
                'tournament' => ['Cannot regenerate — this round has matches that are live or already completed.'],
            ]);
        }

        if ($pairings) {
            return $this->generateFromPairings($tournament, $round, $pairings);
        }

        return $this->generateFromSeeds($tournament, $round);
    }

    /**
     * Ensure the tournament has enough rounds for its draw size.
     * Creates missing rounds with standard snooker names.
     */
    public function ensureRoundsExist(Tournament $tournament): void
    {
        $playerCount = $tournament->approvedEntries()->count();

        if ($playerCount < 2) {
            return;
        }

        $drawSize = $tournament->draw_size ?? $this->nextPowerOfTwo($playerCount);
        $requiredRounds = (int) log($drawSize, 2);
        $existingCount = $tournament->mainDrawRounds()->count();

        if ($existingCount >= $requiredRounds) {
            return;
        }

        $names = $this->getRoundNames($drawSize);
        $maxSortOrder = $tournament->rounds()->max('sort_order') ?? -1;

        // Create only the missing rounds (append after existing ones)
        for ($i = $existingCount; $i < $requiredRounds; $i++) {
            Round::create([
                'tournament_id' => $tournament->id,
                'name' => $names[$i],
                'sort_order' => $maxSortOrder + ($i - $existingCount) + 1,
                'frames_to_win' => 3,
            ]);
        }
    }

    /**
     * Generate standard snooker round names for a given draw size.
     */
    private function getRoundNames(int $drawSize): array
    {
        $roundCount = (int) log($drawSize, 2);
        $names = [];
        $playersInRound = $drawSize;

        for ($i = 0; $i < $roundCount; $i++) {
            $roundsRemaining = $roundCount - $i;

            if ($roundsRemaining === 1) {
                $names[] = 'Final';
            } elseif ($roundsRemaining === 2) {
                $names[] = 'Semi Final';
            } elseif ($roundsRemaining === 3) {
                $names[] = 'Quarter Final';
            } else {
                $names[] = "Round of {$playersInRound}";
            }

            $playersInRound = intdiv($playersInRound, 2);
        }

        return $names;
    }

    /**
     * Generate draw from explicit pairings (random reveal mode).
     * The frontend sends the confirmed pairings after the live reveal.
     */
    private function generateFromPairings(Tournament $tournament, Round $round, array $pairings): Tournament
    {
        DB::transaction(function () use ($tournament, $round, $pairings) {
            // Clear existing matches for this round and subsequent rounds
            Match_::where('tournament_id', $tournament->id)
                ->where('round_id', $round->id)
                ->forceDelete();

            foreach ($pairings as $i => $pairing) {
                Match_::create([
                    'tournament_id' => $tournament->id,
                    'round_id' => $round->id,
                    'position' => $i + 1,
                    'player1_id' => $pairing['player1_id'],
                    'player2_id' => $pairing['player2_id'],
                    'status' => 'scheduled',
                ]);
            }

            $matchCount = count($pairings);

            // Create placeholder matches for subsequent rounds
            $rounds = $tournament->rounds()->where('sort_order', '>', $round->sort_order)
                ->orderBy('sort_order')->get();
            $prevMatchCount = $matchCount;

            foreach ($rounds as $nextRound) {
                $currentMatchCount = intdiv($prevMatchCount, 2);
                if ($currentMatchCount < 1) {
                    break;
                }

                Match_::where('tournament_id', $tournament->id)
                    ->where('round_id', $nextRound->id)
                    ->forceDelete();

                for ($i = 0; $i < $currentMatchCount; $i++) {
                    Match_::create([
                        'tournament_id' => $tournament->id,
                        'round_id' => $nextRound->id,
                        'position' => $i + 1,
                        'status' => 'scheduled',
                    ]);
                }

                $prevMatchCount = $currentMatchCount;
            }
        });

        return $tournament->fresh()->load(['rounds.matches.player1', 'rounds.matches.player2']);
    }

    /**
     * Generate draw from seeded bracket placement (fixed mode).
     * For the first round, uses approved entries with seed-based placement.
     * For later rounds, shuffles winners from the previous round.
     */
    private function generateFromSeeds(Tournament $tournament, Round $round): Tournament
    {
        $isQualifier = $round->is_qualifier;
        $firstMainRound = $tournament->mainDrawRounds()->first()
            ?? $tournament->rounds()->orderBy('sort_order')->first();
        $isFirstRound = ! $isQualifier && $firstMainRound && $firstMainRound->id === $round->id;

        if ($isQualifier || $isFirstRound) {
            if ($isQualifier) {
                // Qualifier round: pool from assigned entries + prev qualifier winners
                $pool = $this->getQualifierRoundPool($tournament, $round);
                $approvedEntries = TournamentEntry::where('tournament_id', $tournament->id)
                    ->where('status', 'approved')
                    ->whereIn('player_id', $pool->pluck('id'))
                    ->with('player')
                    ->get();
            } elseif ($tournament->has_qualifiers) {
                // First main draw round with qualifiers: direct seeds + qualifier survivors
                $directEntries = $tournament->approvedEntries()
                    ->whereNull('entry_round_id')
                    ->with('player')
                    ->get();

                $lastQualifierRound = $tournament->qualifierRounds()
                    ->reorder('sort_order', 'desc')
                    ->first();

                $qualifierWinnerIds = [];
                if ($lastQualifierRound) {
                    $qualifierWinnerIds = Match_::where('tournament_id', $tournament->id)
                        ->where('round_id', $lastQualifierRound->id)
                        ->whereNotNull('winner_id')
                        ->pluck('winner_id')
                        ->toArray();
                }

                $qualifierEntries = collect();
                if (! empty($qualifierWinnerIds)) {
                    $qualifierEntries = TournamentEntry::where('tournament_id', $tournament->id)
                        ->where('status', 'approved')
                        ->whereIn('player_id', $qualifierWinnerIds)
                        ->with('player')
                        ->get();
                }

                $approvedEntries = $directEntries->concat($qualifierEntries)->unique('player_id');
            } else {
                $approvedEntries = $tournament->approvedEntries()->with('player')->get();
            }

            $playerCount = $approvedEntries->count();

            if ($playerCount < 2) {
                throw ValidationException::withMessages([
                    'tournament' => ['At least 2 players are required to generate a draw.'],
                ]);
            }

            $drawSize = $isQualifier
                ? $this->nextPowerOfTwo($playerCount)
                : ($tournament->draw_size ?? $this->nextPowerOfTwo($playerCount));

            $seeded = $approvedEntries->whereNotNull('seed')->sortBy('seed')->values();
            $unseeded = $approvedEntries->whereNull('seed')->shuffle();

            // Build slots: place seeded players first, then fill with unseeded, then byes
            $slots = array_fill(0, $drawSize, null);

            $seedPositions = $this->getSeedPositions($drawSize, $seeded->count());
            $overflow = collect();
            foreach ($seeded as $i => $entry) {
                if (isset($seedPositions[$i])) {
                    $slots[$seedPositions[$i]] = $entry->player_id;
                } else {
                    $overflow->push($entry);
                }
            }

            $fillPool = $overflow->concat($unseeded)->shuffle();
            $fillIndex = 0;
            for ($i = 0; $i < $drawSize; $i++) {
                if ($slots[$i] === null && $fillIndex < $fillPool->count()) {
                    $slots[$i] = $fillPool[$fillIndex]->player_id;
                    $fillIndex++;
                }
            }
        } else {
            // Later rounds: pool = winners from the previous round
            $prevRound = $tournament->rounds()
                ->where('sort_order', '<', $round->sort_order)
                ->reorder('sort_order', 'desc')
                ->first();

            if (! $prevRound) {
                throw ValidationException::withMessages([
                    'round' => ['No previous round found.'],
                ]);
            }

            $winnerIds = Match_::where('tournament_id', $tournament->id)
                ->where('round_id', $prevRound->id)
                ->whereNotNull('winner_id')
                ->orderBy('position')
                ->pluck('winner_id')
                ->toArray();

            $playerCount = count($winnerIds);

            if ($playerCount < 2) {
                throw ValidationException::withMessages([
                    'round' => ['The previous round needs at least 2 completed matches to generate this round.'],
                ]);
            }

            $drawSize = $this->nextPowerOfTwo($playerCount);
            $shuffled = collect($winnerIds)->shuffle()->values()->toArray();

            $slots = array_fill(0, $drawSize, null);
            for ($i = 0; $i < count($shuffled); $i++) {
                $slots[$i] = $shuffled[$i];
            }
        }

        DB::transaction(function () use ($tournament, $round, $slots, $drawSize, $isQualifier) {
            // Clear existing matches for this round
            Match_::where('tournament_id', $tournament->id)
                ->where('round_id', $round->id)
                ->forceDelete();

            $matchCount = $drawSize / 2;
            for ($i = 0; $i < $matchCount; $i++) {
                $player1Id = $slots[$i * 2];
                $player2Id = $slots[$i * 2 + 1];

                $isBye = $player1Id === null || $player2Id === null;
                $winnerId = null;
                $status = 'scheduled';

                if ($isBye) {
                    $winnerId = $player1Id ?? $player2Id;
                    $status = 'bye';
                }

                Match_::create([
                    'tournament_id' => $tournament->id,
                    'round_id' => $round->id,
                    'position' => $i + 1,
                    'player1_id' => $player1Id,
                    'player2_id' => $player2Id,
                    'winner_id' => $winnerId,
                    'status' => $status,
                ]);
            }

            // Qualifier rounds: no subsequent round placeholders or bye advancement
            if (! $isQualifier) {
                // Create placeholder matches for subsequent rounds
                $rounds = $tournament->rounds()->where('sort_order', '>', $round->sort_order)
                    ->orderBy('sort_order')->get();
                $prevMatchCount = $matchCount;

                foreach ($rounds as $nextRound) {
                    $currentMatchCount = intdiv($prevMatchCount, 2);
                    if ($currentMatchCount < 1) {
                        break;
                    }

                    Match_::where('tournament_id', $tournament->id)
                        ->where('round_id', $nextRound->id)
                        ->forceDelete();

                    for ($i = 0; $i < $currentMatchCount; $i++) {
                        Match_::create([
                            'tournament_id' => $tournament->id,
                            'round_id' => $nextRound->id,
                            'position' => $i + 1,
                            'status' => 'scheduled',
                        ]);
                    }

                    $prevMatchCount = $currentMatchCount;
                }

                // Advance bye winners to the next round
                $this->advanceByeWinners($tournament, $round);
            }
        });

        return $tournament->fresh()->load(['rounds.matches.player1', 'rounds.matches.player2']);
    }

    public function confirmDraw(Tournament $tournament, Round $round): Tournament
    {
        $round->update(['generated_at' => now()]);

        return $tournament->fresh()->load('rounds');
    }

    public function rerollDraw(Tournament $tournament, Round $round): Tournament
    {
        return $this->generateDraw($tournament, $round);
    }

    /**
     * Get available players for a qualifier round's pool.
     *
     * Pool = (entries assigned to this round) + (winners from prev qualifier round) − (already paired in this round)
     */
    public function getQualifierRoundPool(Tournament $tournament, Round $round): Collection
    {
        // Direct entrants assigned to this round
        $directEntrantIds = TournamentEntry::where('tournament_id', $tournament->id)
            ->where('status', 'approved')
            ->where('entry_round_id', $round->id)
            ->pluck('player_id')
            ->toArray();

        // Winners from previous qualifier round
        $prevQualifierRound = $tournament->qualifierRounds()
            ->where('sort_order', '<', $round->sort_order)
            ->reorder('sort_order', 'desc')
            ->first();

        $advancedWinnerIds = [];
        if ($prevQualifierRound) {
            $advancedWinnerIds = Match_::where('tournament_id', $tournament->id)
                ->where('round_id', $prevQualifierRound->id)
                ->whereNotNull('winner_id')
                ->pluck('winner_id')
                ->toArray();
        }

        $poolIds = array_unique(array_merge($directEntrantIds, $advancedWinnerIds));

        // Subtract already-paired players in this round
        $pairedIds = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $round->id)
            ->get()
            ->flatMap(fn ($m) => array_filter([$m->player1_id, $m->player2_id]))
            ->unique()
            ->toArray();

        $availableIds = array_diff($poolIds, $pairedIds);

        return Player::whereIn('id', $availableIds)->get();
    }

    /**
     * Create a single qualifier match (manual pairing).
     */
    public function createQualifierMatch(Tournament $tournament, Round $round, int $player1Id, int $player2Id): Match_
    {
        if (! $round->is_qualifier) {
            throw ValidationException::withMessages([
                'round' => ['This round is not a qualifier round.'],
            ]);
        }

        $pool = $this->getQualifierRoundPool($tournament, $round);
        $poolIds = $pool->pluck('id')->toArray();

        if (! in_array($player1Id, $poolIds) || ! in_array($player2Id, $poolIds)) {
            throw ValidationException::withMessages([
                'players' => ['One or both players are not in the available pool for this round.'],
            ]);
        }

        $maxPosition = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $round->id)
            ->max('position') ?? 0;

        return Match_::create([
            'tournament_id' => $tournament->id,
            'round_id' => $round->id,
            'position' => $maxPosition + 1,
            'player1_id' => $player1Id,
            'player2_id' => $player2Id,
            'status' => 'scheduled',
        ]);
    }

    /**
     * Auto-pair all available pool players in a qualifier round.
     * Shuffles the pool and creates matches for each pair.
     * Returns the number of matches created.
     */
    public function generateQualifierDraw(Tournament $tournament, Round $round): int
    {
        if (! $round->is_qualifier) {
            throw ValidationException::withMessages([
                'round' => ['This round is not a qualifier round.'],
            ]);
        }

        $pool = $this->getQualifierRoundPool($tournament, $round);

        if ($pool->count() < 2) {
            throw ValidationException::withMessages([
                'pool' => ['Need at least 2 available players in the pool to generate matches.'],
            ]);
        }

        $shuffled = $pool->shuffle()->values();
        $maxPosition = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $round->id)
            ->max('position') ?? 0;

        $matchesCreated = 0;
        for ($i = 0; $i + 1 < $shuffled->count(); $i += 2) {
            Match_::create([
                'tournament_id' => $tournament->id,
                'round_id' => $round->id,
                'position' => $maxPosition + $matchesCreated + 1,
                'player1_id' => $shuffled[$i]->id,
                'player2_id' => $shuffled[$i + 1]->id,
                'status' => 'scheduled',
            ]);
            $matchesCreated++;
        }

        return $matchesCreated;
    }

    /**
     * Delete a qualifier match (must not be played yet).
     */
    public function deleteQualifierMatch(Match_ $match): void
    {
        $round = $match->round;

        if (! $round || ! $round->is_qualifier) {
            throw ValidationException::withMessages([
                'match' => ['This match is not in a qualifier round.'],
            ]);
        }

        if (in_array($match->status, ['completed', 'walkover', 'live'])) {
            throw ValidationException::withMessages([
                'match' => ['Cannot delete a match that has already been played or is live.'],
            ]);
        }

        $match->forceDelete();
    }

    private function nextPowerOfTwo(int $n): int
    {
        $power = 1;
        while ($power < $n) {
            $power *= 2;
        }

        return $power;
    }

    private function getSeedPositions(int $drawSize, int $seedCount): array
    {
        if ($seedCount === 0) {
            return [];
        }

        $matchCount = $drawSize / 2;
        $positions = [];

        // Seed 1 gets slot 0 (top of bracket)
        if ($seedCount >= 1) {
            $positions[0] = 0;
        }
        // Seed 2 gets last slot (bottom of bracket)
        if ($seedCount >= 2) {
            $positions[1] = $drawSize - 1;
        }
        // Seed 3 gets bottom of top half
        if ($seedCount >= 3) {
            $positions[2] = $matchCount;
        }
        // Seed 4 gets top of bottom half
        if ($seedCount >= 4) {
            $positions[3] = $matchCount - 1;
        }

        // For seeds 5-8 and beyond, distribute in quarter sections
        if ($seedCount > 4) {
            $quarter = $drawSize / 4;
            $quarterPositions = [
                $quarter,
                $drawSize - 1 - $quarter,
                $quarter - 1,
                $drawSize - $quarter,
            ];

            for ($i = 4; $i < min($seedCount, 8); $i++) {
                if (isset($quarterPositions[$i - 4])) {
                    $positions[$i] = $quarterPositions[$i - 4];
                }
            }
        }

        return $positions;
    }

    private function advanceByeWinners(Tournament $tournament, Round $round): void
    {
        $nextRound = $tournament->rounds()
            ->where('sort_order', '>', $round->sort_order)
            ->orderBy('sort_order')
            ->first();

        if (! $nextRound) {
            return;
        }

        $byeMatches = Match_::where('tournament_id', $tournament->id)
            ->where('round_id', $round->id)
            ->where('status', 'bye')
            ->whereNotNull('winner_id')
            ->orderBy('position')
            ->get();

        foreach ($byeMatches as $byeMatch) {
            $nextPosition = intdiv($byeMatch->position - 1, 2) + 1;
            $isPlayer1 = ($byeMatch->position % 2) === 1;

            $nextMatch = Match_::where('tournament_id', $tournament->id)
                ->where('round_id', $nextRound->id)
                ->where('position', $nextPosition)
                ->first();

            if ($nextMatch) {
                $nextMatch->update([
                    $isPlayer1 ? 'player1_id' : 'player2_id' => $byeMatch->winner_id,
                ]);
            }
        }
    }
}
