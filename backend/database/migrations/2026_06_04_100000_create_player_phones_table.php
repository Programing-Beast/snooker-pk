<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_phones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->cascadeOnDelete();
            $table->string('phone', 50);
            $table->string('label', 50)->default('Primary');
            $table->timestamps();

            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_phones');
    }
};
