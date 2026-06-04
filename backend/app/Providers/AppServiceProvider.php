<?php

namespace App\Providers;

use App\Models\Break_;
use App\Models\Match_;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::model('match', Match_::class);
        Route::model('break_', Break_::class);
    }
}
