<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('position_label');
            $table->decimal('amount', 12, 2);
            $table->integer('count')->default(1);
            $table->string('note')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_highlight')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prizes');
    }
};
