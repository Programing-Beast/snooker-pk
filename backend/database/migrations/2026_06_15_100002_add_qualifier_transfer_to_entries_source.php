<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE tournament_entries MODIFY COLUMN source ENUM('self_request','admin_added','qualifier_transfer') NOT NULL DEFAULT 'self_request'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tournament_entries MODIFY COLUMN source ENUM('self_request','admin_added') NOT NULL DEFAULT 'self_request'");
    }
};
