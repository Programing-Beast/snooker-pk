<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->foreignId('parent_tournament_id')
                ->nullable()
                ->after('draw_size')
                ->constrained('tournaments')
                ->nullOnDelete();
            $table->unsignedInteger('qualifying_slots')
                ->nullable()
                ->after('parent_tournament_id');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropForeign(['parent_tournament_id']);
            $table->dropColumn(['parent_tournament_id', 'qualifying_slots']);
        });
    }
};
