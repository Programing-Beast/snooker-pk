<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prize_awards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('match_id')->nullable()->constrained('matches')->nullOnDelete();
            $table->foreignId('round_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->foreignId('prize_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->boolean('is_ranking')->default(false);
            $table->string('category');
            $table->string('status')->default('awarded');
            $table->string('reason')->nullable();
            $table->foreignId('awarded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('awarded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['player_id', 'is_ranking', 'status']);
            $table->index('tournament_id');
            $table->index('match_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prize_awards');
    }
};
