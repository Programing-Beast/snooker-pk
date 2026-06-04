<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->foreignId('winner_id')->nullable()->constrained('players')->nullOnDelete();
            $table->foreignId('runner_up_id')->nullable()->constrained('players')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('winner_id');
            $table->dropConstrainedForeignId('runner_up_id');
        });
    }
};
