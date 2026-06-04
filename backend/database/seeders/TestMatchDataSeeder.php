<?php

namespace Database\Seeders;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Round;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TestMatchDataSeeder extends Seeder
{
    public function run(): void
    {
        $tournament1 = Tournament::find(1);
        $tournament2 = Tournament::find(2);

        if (! $tournament1 || ! $tournament2) {
            $this->command->warn('Tournaments not found. Run the app and create tournaments first.');
            return;
        }

        // Update tournament 1 to "live" status with proper dates
        $tournament1->update([
            'status' => 'live',
            'start_date' => Carbon::now()->subDays(3),
            'end_date' => Carbon::now()->addDays(4),
        ]);

        // Update tournament 2 to "completed" status
        $tournament2->update([
            'status' => 'completed',
            'start_date' => Carbon::now()->subDays(30),
            'end_date' => Carbon::now()->subDays(25),
        ]);

        // Get rounds for each tournament
        $t1Round = Round::where('tournament_id', $tournament1->id)->first();
        $t2Rounds = Round::where('tournament_id', $tournament2->id)
            ->orderBy('sort_order')->get();

        // Create completed match history in tournament 2 (the completed tournament)
        // M. Asif (1) had a strong run: won R32, R16, QF, lost in SF
        $completedMatches = [
            // Round of 32 results
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 1, 'player2_id' => 30, 'score1' => 3, 'score2' => 1, 'winner_id' => 1, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 2, 'player2_id' => 29, 'score1' => 3, 'score2' => 0, 'winner_id' => 2, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 3, 'player2_id' => 28, 'score1' => 3, 'score2' => 2, 'winner_id' => 3, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 4, 'player2_id' => 27, 'score1' => 3, 'score2' => 1, 'winner_id' => 4, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 5, 'player2_id' => 26, 'score1' => 2, 'score2' => 3, 'winner_id' => 26, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 6, 'player2_id' => 25, 'score1' => 3, 'score2' => 0, 'winner_id' => 6, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 7, 'player2_id' => 24, 'score1' => 1, 'score2' => 3, 'winner_id' => 24, 'scheduled_at' => Carbon::now()->subDays(30)],
            ['round_id' => $t2Rounds[0]->id, 'player1_id' => 8, 'player2_id' => 23, 'score1' => 3, 'score2' => 2, 'winner_id' => 8, 'scheduled_at' => Carbon::now()->subDays(30)],

            // Round of 16 results
            ['round_id' => $t2Rounds[1]->id, 'player1_id' => 1, 'player2_id' => 8, 'score1' => 3, 'score2' => 2, 'winner_id' => 1, 'scheduled_at' => Carbon::now()->subDays(28)],
            ['round_id' => $t2Rounds[1]->id, 'player1_id' => 2, 'player2_id' => 3, 'score1' => 3, 'score2' => 1, 'winner_id' => 2, 'scheduled_at' => Carbon::now()->subDays(28)],
            ['round_id' => $t2Rounds[1]->id, 'player1_id' => 4, 'player2_id' => 6, 'score1' => 2, 'score2' => 3, 'winner_id' => 6, 'scheduled_at' => Carbon::now()->subDays(28)],
            ['round_id' => $t2Rounds[1]->id, 'player1_id' => 26, 'player2_id' => 24, 'score1' => 3, 'score2' => 0, 'winner_id' => 26, 'scheduled_at' => Carbon::now()->subDays(28)],

            // Quarter-finals
            ['round_id' => $t2Rounds[2]->id, 'player1_id' => 1, 'player2_id' => 26, 'score1' => 3, 'score2' => 1, 'winner_id' => 1, 'scheduled_at' => Carbon::now()->subDays(27)],
            ['round_id' => $t2Rounds[2]->id, 'player1_id' => 2, 'player2_id' => 6, 'score1' => 3, 'score2' => 2, 'winner_id' => 2, 'scheduled_at' => Carbon::now()->subDays(27)],

            // Semifinals - M. Asif loses to S. Khan
            ['round_id' => $t2Rounds[3]->id, 'player1_id' => 1, 'player2_id' => 2, 'score1' => 2, 'score2' => 3, 'winner_id' => 2, 'scheduled_at' => Carbon::now()->subDays(26)],

            // Final - S. Khan wins the tournament
            ['round_id' => $t2Rounds[4]->id, 'player1_id' => 2, 'player2_id' => 6, 'score1' => 3, 'score2' => 1, 'winner_id' => 2, 'scheduled_at' => Carbon::now()->subDays(25)],
        ];

        foreach ($completedMatches as $data) {
            Match_::create([
                'tournament_id' => $tournament2->id,
                'round_id' => $data['round_id'],
                'position' => 1,
                'player1_id' => $data['player1_id'],
                'player2_id' => $data['player2_id'],
                'score1' => $data['score1'],
                'score2' => $data['score2'],
                'winner_id' => $data['winner_id'],
                'status' => 'completed',
                'scheduled_at' => $data['scheduled_at'],
            ]);
        }

        // Update existing scheduled matches in tournament 1 with scheduled_at dates
        $scheduledMatches = Match_::where('tournament_id', $tournament1->id)
            ->where('status', 'scheduled')
            ->get();

        foreach ($scheduledMatches as $i => $match) {
            $match->update([
                'scheduled_at' => Carbon::now()->addDays(1)->addHours($i),
            ]);
        }

        // Also mark some of tournament 1's round 1 matches as completed
        // (simulating tournament in progress)
        $t1Matches = Match_::where('tournament_id', $tournament1->id)
            ->where('round_id', $t1Round->id)
            ->where('status', 'scheduled')
            ->take(8)
            ->get();

        $results = [
            [3, 1], [3, 0], [3, 2], [2, 3],
            [3, 1], [1, 3], [3, 2], [3, 0],
        ];

        foreach ($t1Matches as $i => $match) {
            if ($i >= count($results)) break;
            if (! $match->player1_id || ! $match->player2_id) continue;

            [$s1, $s2] = $results[$i];
            $winnerId = $s1 > $s2 ? $match->player1_id : $match->player2_id;

            $match->update([
                'score1' => $s1,
                'score2' => $s2,
                'winner_id' => $winnerId,
                'status' => 'completed',
                'scheduled_at' => Carbon::now()->subDays(rand(1, 3)),
            ]);
        }

        // Set one match to "live" status for testing
        $liveMatch = Match_::where('tournament_id', $tournament1->id)
            ->where('status', 'scheduled')
            ->whereNotNull('player1_id')
            ->whereNotNull('player2_id')
            ->first();

        if ($liveMatch) {
            $liveMatch->update([
                'status' => 'live',
                'score1' => 2,
                'score2' => 1,
                'current_frame_no' => 4,
                'table_no' => 1,
                'scheduled_at' => Carbon::now(),
            ]);
        }

        $this->command->info('Test match data seeded successfully.');
        $this->command->info('  - ' . count($completedMatches) . ' completed matches in tournament 2');
        $this->command->info('  - ' . min(8, $t1Matches->count()) . ' completed matches in tournament 1');
        $this->command->info('  - 1 live match in tournament 1');
    }
}
