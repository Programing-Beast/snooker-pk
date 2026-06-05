<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Upgrade existing label-matched prizes that still have type='custom'
        DB::table('prizes')
            ->where('type', 'custom')
            ->whereNull('deleted_at')
            ->whereRaw('LOWER(position_label) = ?', ['winner'])
            ->update(['type' => 'winner']);

        DB::table('prizes')
            ->where('type', 'custom')
            ->whereNull('deleted_at')
            ->whereRaw('LOWER(position_label) = ?', ['runner-up'])
            ->update(['type' => 'runner_up']);

        // Remove duplicate zero-amount system prizes where a non-zero one exists
        $tournaments = DB::table('prizes')
            ->whereIn('type', ['winner', 'runner_up'])
            ->whereNull('deleted_at')
            ->select('tournament_id', 'type')
            ->groupBy('tournament_id', 'type')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($tournaments as $row) {
            // Keep the one with the highest amount, soft-delete the rest
            $keep = DB::table('prizes')
                ->where('tournament_id', $row->tournament_id)
                ->where('type', $row->type)
                ->whereNull('deleted_at')
                ->orderByDesc('amount')
                ->first();

            if ($keep) {
                DB::table('prizes')
                    ->where('tournament_id', $row->tournament_id)
                    ->where('type', $row->type)
                    ->whereNull('deleted_at')
                    ->where('id', '!=', $keep->id)
                    ->update(['deleted_at' => now()]);
            }
        }
    }

    public function down(): void
    {
        // No-op: can't reliably reverse cleanup
    }
};
