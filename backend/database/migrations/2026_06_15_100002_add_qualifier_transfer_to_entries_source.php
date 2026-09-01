<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_entries', function (Blueprint $table) {
            $table->enum('source', ['self_request', 'admin_added', 'qualifier_transfer'])
                ->default('self_request')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('tournament_entries', function (Blueprint $table) {
            $table->enum('source', ['self_request', 'admin_added'])
                ->default('self_request')
                ->change();
        });
    }
};
