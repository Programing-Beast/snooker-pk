<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prizes', function (Blueprint $table) {
            $table->string('type')->default('custom')->after('position_label');
            $table->boolean('ranking_prize')->default(true)->after('is_highlight');
            $table->boolean('multiple')->default(false)->after('ranking_prize');
            $table->integer('score_threshold')->nullable()->after('multiple');
        });

        // Data fixup: set type for existing winner/runner-up prizes
        DB::table('prizes')
            ->whereRaw('LOWER(position_label) = ?', ['winner'])
            ->update(['type' => 'winner']);

        DB::table('prizes')
            ->whereRaw('LOWER(position_label) = ?', ['runner-up'])
            ->update(['type' => 'runner_up']);
    }

    public function down(): void
    {
        Schema::table('prizes', function (Blueprint $table) {
            $table->dropColumn(['type', 'ranking_prize', 'multiple', 'score_threshold']);
        });
    }
};
