<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->boolean('has_qualifiers')->default(false)->after('draw_size');
        });

        Schema::table('rounds', function (Blueprint $table) {
            $table->boolean('is_qualifier')->default(false)->after('sort_order');
        });

        Schema::table('tournament_entries', function (Blueprint $table) {
            $table->foreignId('entry_round_id')
                ->nullable()
                ->after('seed')
                ->constrained('rounds')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tournament_entries', function (Blueprint $table) {
            $table->dropForeign(['entry_round_id']);
            $table->dropColumn('entry_round_id');
        });

        Schema::table('rounds', function (Blueprint $table) {
            $table->dropColumn('is_qualifier');
        });

        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn('has_qualifiers');
        });
    }
};
