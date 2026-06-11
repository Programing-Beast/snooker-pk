<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BreakController;
use App\Http\Controllers\Api\TournamentOrganizerController;
use App\Http\Controllers\Api\DrawController;
use App\Http\Controllers\Api\EntryController;
use App\Http\Controllers\Api\FrameController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\PlayerPhoneController;
use App\Http\Controllers\Api\PrizeAwardController;
use App\Http\Controllers\Api\PrizeController;
use App\Http\Controllers\Api\RankingController;
use App\Http\Controllers\Api\RoundController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/players', [PlayerController::class, 'index']);
Route::get('/players/{player}', [PlayerController::class, 'show']);
Route::get('/players/{player}/history', [PlayerController::class, 'history']);
Route::get('/players/{player}/upcoming', [PlayerController::class, 'upcoming']);

Route::get('/tournaments', [TournamentController::class, 'index']);
Route::get('/tournaments/{slug}', [TournamentController::class, 'show'])->where('slug', '[a-zA-Z0-9\-]+');
Route::get('/tournaments/{tournament}/draw', [TournamentController::class, 'draw']);
Route::get('/tournaments/{tournament}/players', [TournamentController::class, 'players']);

Route::get('/rankings', [RankingController::class, 'index']);

Route::get('/stats', function () {
    return response()->json([
        'data' => [
            'players' => \App\Models\Player::where('status', 'active')->count(),
            'tournaments' => \App\Models\Tournament::count(),
            'cities' => \App\Models\Player::where('status', 'active')->whereNotNull('city')->distinct('city')->count(),
        ],
    ]);
});

Route::get('/matches/{match}', [MatchController::class, 'show']);
Route::get('/tournaments/{tournament}/prize-awards', [PrizeAwardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Player — own profile
    Route::put('/players/{player}', [PlayerController::class, 'update']);

    // Player phones — authenticated (admin or own player, enforced in request)
    Route::get('/players/{player}/phones', [PlayerPhoneController::class, 'index']);
    Route::post('/players/{player}/phones', [PlayerPhoneController::class, 'store']);
    Route::put('/player-phones/{playerPhone}', [PlayerPhoneController::class, 'update']);
    Route::delete('/player-phones/{playerPhone}', [PlayerPhoneController::class, 'destroy']);

    // Entries — player self-service
    Route::post('/entries/request', [EntryController::class, 'request']);
    Route::get('/entries/mine', [EntryController::class, 'mine']);

    /*
    |----------------------------------------------------------------------
    | Umpire Routes
    |----------------------------------------------------------------------
    */

    Route::middleware('role:umpire')->get('/umpire/matches', [MatchController::class, 'umpireMatches']);

    Route::middleware(['role:umpire|admin', 'assigned_umpire'])->group(function () {
        Route::get('/matches/{match}/board', [MatchController::class, 'board']);
        Route::post('/matches/{match}/frames', [FrameController::class, 'store']);
        Route::put('/frames/{frame}', [FrameController::class, 'update']);
        Route::post('/frames/{frame}/breaks', [BreakController::class, 'store']);
        Route::put('/breaks/{break_}', [BreakController::class, 'update']);
        Route::delete('/breaks/{break_}', [BreakController::class, 'destroy']);
    });

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        // Umpire users list
        Route::get('/admin/umpires', [AuthController::class, 'umpires']);

        // Players — admin create
        Route::post('/players', [PlayerController::class, 'store']);

        // Tournaments — full CRUD
        Route::post('/tournaments', [TournamentController::class, 'store']);
        Route::put('/tournaments/{tournament}', [TournamentController::class, 'update']);
        Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy']);
        Route::put('/tournaments/{tournament}/entry-status', [TournamentController::class, 'updateEntryStatus']);
        Route::put('/tournaments/{tournament}/max-players', [TournamentController::class, 'updateMaxPlayers']);

        // Nested Resources — Prizes
        Route::get('/tournaments/{tournament}/prizes', [PrizeController::class, 'index']);
        Route::post('/tournaments/{tournament}/prizes', [PrizeController::class, 'store']);
        Route::get('/prizes/{prize}', [PrizeController::class, 'show']);
        Route::put('/prizes/{prize}', [PrizeController::class, 'update']);
        Route::delete('/prizes/{prize}', [PrizeController::class, 'destroy']);

        // Nested Resources — Organizers
        Route::get('/tournaments/{tournament}/organizers', [TournamentOrganizerController::class, 'index']);
        Route::post('/tournaments/{tournament}/organizers', [TournamentOrganizerController::class, 'store']);
        Route::put('/tournament-organizers/{organizer}', [TournamentOrganizerController::class, 'update']);
        Route::delete('/tournament-organizers/{organizer}', [TournamentOrganizerController::class, 'destroy']);

        // Nested Resources — Rounds
        Route::get('/tournaments/{tournament}/rounds', [RoundController::class, 'index']);
        Route::post('/tournaments/{tournament}/rounds', [RoundController::class, 'store']);
        Route::get('/rounds/{round}', [RoundController::class, 'show']);
        Route::put('/rounds/{round}', [RoundController::class, 'update']);
        Route::delete('/rounds/{round}', [RoundController::class, 'destroy']);

        // Entries — admin management
        Route::get('/tournaments/{tournament}/entries', [EntryController::class, 'summary']);
        Route::post('/entries/admin-add', [EntryController::class, 'adminAdd']);
        Route::put('/entries/{entry}/approve', [EntryController::class, 'approve']);
        Route::put('/entries/{entry}/reject', [EntryController::class, 'reject']);
        Route::put('/entries/{entry}/seed', [EntryController::class, 'setSeed']);

        // Draw
        Route::get('/draw/{tournament}/preview', [DrawController::class, 'preview']);
        Route::post('/draw/generate', [DrawController::class, 'generate']);
        Route::post('/draw/confirm', [DrawController::class, 'confirm']);
        Route::post('/draw/reroll', [DrawController::class, 'reroll']);

        // Matches — admin management
        Route::put('/matches/{match}', [MatchController::class, 'update']);
        Route::post('/matches/{match}/assign-umpire', [MatchController::class, 'assignUmpire']);
        Route::post('/matches/{match}/walkover', [MatchController::class, 'walkover']);
        Route::post('/matches/{match}/complete', [MatchController::class, 'complete']);
        Route::post('/matches/{match}/declare-winner', [MatchController::class, 'declareWinner']);

        // Rankings
        Route::post('/rankings/adjust', [RankingController::class, 'adjust']);

        // Prize Awards
        Route::post('/prize-awards', [PrizeAwardController::class, 'store']);
        Route::post('/prize-awards/bulk', [PrizeAwardController::class, 'bulk']);
        Route::put('/prize-awards/{prizeAward}', [PrizeAwardController::class, 'update']);
        Route::get('/players/{player}/prize-history', [PrizeAwardController::class, 'playerHistory']);
        Route::get('/tournaments/{tournament}/eligible-players', [PrizeAwardController::class, 'eligiblePlayers']);
    });
});
