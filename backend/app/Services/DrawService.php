<?php

namespace App\Services;

use App\Models\Match_;
use App\Models\Round;
use App\Models\Tournament;
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

    public function generateDraw(Tournament $tournament, Round $round, ?array $pairings = null): Tournament
    {
        // Prevent regeneration when the bracket already has results
        $hasResults = Match_::where('tournament_id', $tournament->id)
            ->whereIn('status', ['completed', 'walkover', 'live'])
            ->exists();

        if ($hasResults) {
            throw ValidationException::withMessages([
                'tournament' => ['Cannot regenerate draw — matches with results already exist in this tournament.'],
            ]);
        }

        // Only allow generation for the first round — subsequent rounds are created as placeholders
        $firstRound = $tournament->rounds()->orderBy('sort_order')->first();

        if ($firstRound && $firstRound->id !== $round->id) {
            throw ValidationException::withMessages([
                'round' => ['Draw can only be generated for the first round. Subsequent rounds are filled automatically as matches complete.'],
            ]);
        }

        if ($pairings) {
            return $this->generateFromPairings($tournament, $round, $pairings);
        }

        return $this->generateFromSeeds($tournament, $round);
    }

    /**
     * Generate draw from explicit pairings (random reveal mode).
     * The frontend sends the confirmed pairings after the live reveal.
     */
    private function generateFromPairings(Tournament $tournament, Round $round, array $pairings): Tournament
    {
        // Validate enough rounds exist for the bracket to complete
        $drawSize = $this->nextPowerOfTwo(count($pairings) * 2);
        $requiredRounds = (int) log($drawSize, 2);
        $totalRounds = $tournament->rounds()->count();

        if ($totalRounds < $requiredRounds) {
            $playerCount = count($pairings) * 2;
            throw ValidationException::withMessages([
                'rounds' => ["Not enough rounds for {$playerCount} players (draw size {$drawSize}). Need at least {$requiredRounds} rounds, but only {$totalRounds} exist."],
            ]);
        }

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
     */
    private function generateFromSeeds(Tournament $tournament, Round $round): Tournament
    {
        $approvedEntries = $tournament->approvedEntries()->with('player')->get();
        $playerCount = $approvedEntries->count();

        if ($playerCount < 2) {
            throw ValidationException::withMessages([
                'tournament' => ['At least 2 approved players are required to generate a draw.'],
            ]);
        }

        $drawSize = $tournament->draw_size ?? $this->nextPowerOfTwo($playerCount);

        // Validate enough rounds exist for the bracket to complete
        $requiredRounds = (int) log($drawSize, 2);
        $totalRounds = $tournament->rounds()->count();

        if ($totalRounds < $requiredRounds) {
            throw ValidationException::withMessages([
                'rounds' => ["Not enough rounds for {$playerCount} players (draw size {$drawSize}). Need at least {$requiredRounds} rounds, but only {$totalRounds} exist."],
            ]);
        }

        $seeded = $approvedEntries->whereNotNull('seed')->sortBy('seed')->values();
        $unseeded = $approvedEntries->whereNull('seed')->shuffle();

        // Build slots: place seeded players first, then fill with unseeded, then byes
        $slots = array_fill(0, $drawSize, null);

        // Place top seeded players in standard bracket positions
        $seedPositions = $this->getSeedPositions($drawSize, $seeded->count());
        $overflow = collect();
        foreach ($seeded as $i => $entry) {
            if (isset($seedPositions[$i])) {
                $slots[$seedPositions[$i]] = $entry->player_id;
            } else {
                $overflow->push($entry);
            }
        }

        // Merge overflow seeded players with unseeded, then shuffle to fill remaining slots
        $fillPool = $overflow->concat($unseeded)->shuffle();
        $fillIndex = 0;
        for ($i = 0; $i < $drawSize; $i++) {
            if ($slots[$i] === null && $fillIndex < $fillPool->count()) {
                $slots[$i] = $fillPool[$fillIndex]->player_id;
                $fillIndex++;
            }
        }

        DB::transaction(function () use ($tournament, $round, $slots, $drawSize) {
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
