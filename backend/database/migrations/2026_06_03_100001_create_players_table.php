<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->char('country_code', 3)->default('PAK');
            $table->string('city')->nullable();
            $table->enum('tier', ['pro', 'amateur'])->default('amateur');
            $table->string('photo_path')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('bio')->nullable();
            $table->date('date_turned_pro')->nullable();
            $table->integer('ranking_points')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
