<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('round_id')->constrained()->cascadeOnDelete();
            $table->integer('position');
            $table->foreignId('player1_id')->nullable()->constrained('players')->nullOnDelete();
            $table->foreignId('player2_id')->nullable()->constrained('players')->nullOnDelete();
            $table->integer('score1')->default(0);
            $table->integer('score2')->default(0);
            $table->foreignId('winner_id')->nullable()->constrained('players')->nullOnDelete();
            $table->enum('status', ['scheduled', 'live', 'completed', 'bye', 'walkover'])->default('scheduled');
            $table->enum('mode', ['singles', 'doubles', 'century'])->default('singles');
            $table->foreignId('umpire_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('table_no')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->string('video_url')->nullable();
            $table->integer('current_frame_no')->default(1);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
