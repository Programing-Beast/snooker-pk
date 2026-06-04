<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frame_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player_id')->constrained();
            $table->integer('points')->default(0);
            $table->json('balls')->nullable();
            $table->integer('fouls')->default(0);
            $table->integer('foul_points')->default(0);
            $table->integer('duration_seconds')->nullable();
            $table->integer('sort_order');
            $table->boolean('is_foul_turn')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breaks');
    }
};
