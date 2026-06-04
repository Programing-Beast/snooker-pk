<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('edition')->nullable();
            $table->string('slug')->unique();
            $table->string('type')->nullable();
            $table->string('format')->default('Knockout · single elimination');
            $table->string('venue')->nullable();
            $table->string('city')->nullable();
            $table->char('country_code', 3)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->string('cover_path')->nullable();
            $table->text('description')->nullable();
            $table->text('qualifier_info')->nullable();
            $table->string('organizer')->nullable();
            $table->string('presented_by')->nullable();
            $table->decimal('prize_pool', 12, 2)->nullable();
            $table->enum('status', ['upcoming', 'live', 'completed'])->default('upcoming');
            $table->enum('entry_status', ['open', 'closed'])->default('open');
            $table->integer('max_players')->nullable();
            $table->integer('draw_size')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
