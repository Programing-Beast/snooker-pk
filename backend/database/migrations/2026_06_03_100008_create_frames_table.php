<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained()->cascadeOnDelete();
            $table->integer('frame_no');
            $table->integer('score1')->default(0);
            $table->integer('score2')->default(0);
            $table->foreignId('winner_id')->nullable()->constrained('players')->nullOnDelete();
            $table->integer('high_break_value')->nullable();
            $table->foreignId('high_break_player_id')->nullable()->constrained('players')->nullOnDelete();
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            $table->foreignId('breaker_id')->nullable()->constrained('players')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['match_id', 'frame_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frames');
    }
};
