<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->renameColumn('video_url', 'youtube_url');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->string('facebook_url', 500)->nullable()->after('youtube_url');
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn('facebook_url');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->renameColumn('youtube_url', 'video_url');
        });
    }
};
