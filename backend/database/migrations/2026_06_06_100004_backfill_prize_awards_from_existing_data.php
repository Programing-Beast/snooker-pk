<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tournaments = DB::table('tournaments')
            ->where('status', 'completed')
            ->whereNotNull('winner_id')
            ->get();

        foreach ($tournaments as $tournament) {
            $prizes = DB::table('prizes')
                ->where('tournament_id', $tournament->id)
                ->whereNull('deleted_at')
                ->get();

            $winnerPrize = $prizes->first(fn ($p) => strcasecmp($p->position_label, 'Winner') === 0);
            $runnerUpPrize = $prizes->first(fn ($p) => strcasecmp($p->position_label, 'Runner-up') === 0);

            if ($winnerPrize && $winnerPrize->amount > 0 && $tournament->winner_id) {
                DB::table('prize_awards')->insert([
                    'tournament_id' => $tournament->id,
                    'player_id' => $tournament->winner_id,
                    'prize_id' => $winnerPrize->id,
                    'amount' => $winnerPrize->amount,
                    'is_ranking' => true,
                    'category' => 'tournament_winner',
                    'status' => 'awarded',
                    'awarded_at' => $tournament->updated_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($runnerUpPrize && $runnerUpPrize->amount > 0 && $tournament->runner_up_id) {
                DB::table('prize_awards')->insert([
                    'tournament_id' => $tournament->id,
                    'player_id' => $tournament->runner_up_id,
                    'prize_id' => $runnerUpPrize->id,
                    'amount' => $runnerUpPrize->amount,
                    'is_ranking' => true,
                    'category' => 'tournament_runner_up',
                    'status' => 'awarded',
                    'awarded_at' => $tournament->updated_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Reconcile ranking_points from ledger
        $playerTotals = DB::table('prize_awards')
            ->where('is_ranking', true)
            ->where('status', 'awarded')
            ->whereNull('deleted_at')
            ->groupBy('player_id')
            ->selectRaw('player_id, SUM(amount) as total')
            ->get();

        foreach ($playerTotals as $row) {
            DB::table('players')
                ->where('id', $row->player_id)
                ->update(['ranking_points' => (int) $row->total]);
        }
    }

    public function down(): void
    {
        DB::table('prize_awards')
            ->whereIn('category', ['tournament_winner', 'tournament_runner_up'])
            ->delete();
    }
};
