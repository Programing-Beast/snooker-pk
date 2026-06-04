<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sub_label')->nullable();
            $table->integer('sort_order');
            $table->integer('frames_to_win');
            $table->enum('draw_mode', ['fixed', 'random'])->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rounds');
    }
};
