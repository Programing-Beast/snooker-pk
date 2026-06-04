<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListTournamentsRequest;
use App\Http\Requests\StoreTournamentRequest;
use App\Http\Requests\UpdateEntryStatusRequest;
use App\Http\Requests\UpdateMaxPlayersRequest;
use App\Http\Requests\UpdateTournamentRequest;
use App\Http\Resources\PlayerResource;
use App\Http\Resources\RoundResource;
use App\Http\Resources\TournamentEntryResource;
use App\Http\Resources\TournamentDetailResource;
use App\Http\Resources\TournamentResource;
use App\Models\Tournament;
use App\Services\TournamentService;
use Illuminate\Http\JsonResponse;

class TournamentController extends Controller
{
    public function __construct(private TournamentService $tournamentService) {}

    public function index(ListTournamentsRequest $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return TournamentResource::collection(
            $this->tournamentService->list($request->validated())
        );
    }

    public function show(string $slug): TournamentDetailResource
    {
        return new TournamentDetailResource(
            $this->tournamentService->showBySlug($slug)
        );
    }

    public function store(StoreTournamentRequest $request): JsonResponse
    {
        $tournament = $this->tournamentService->create($request->validated());

        return (new TournamentResource($tournament))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateTournamentRequest $request, Tournament $tournament): TournamentResource
    {
        return new TournamentResource(
            $this->tournamentService->update($tournament, $request->validated())
        );
    }

    public function destroy(Tournament $tournament): JsonResponse
    {
        $this->tournamentService->delete($tournament);

        return response()->json(['message' => 'Tournament deleted.'], 200);
    }

    public function draw(Tournament $tournament): JsonResponse
    {
        return response()->json([
            'data' => RoundResource::collection(
                $tournament->rounds()->with(['matches.player1', 'matches.player2', 'matches.winner'])->get()
            ),
        ]);
    }

    public function players(Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return TournamentEntryResource::collection(
            $this->tournamentService->players($tournament)
        );
    }

    public function updateEntryStatus(UpdateEntryStatusRequest $request, Tournament $tournament): TournamentResource
    {
        return new TournamentResource(
            $this->tournamentService->updateEntryStatus($tournament, $request->validated()['entry_status'])
        );
    }

    public function updateMaxPlayers(UpdateMaxPlayersRequest $request, Tournament $tournament): TournamentResource
    {
        return new TournamentResource(
            $this->tournamentService->updateMaxPlayers($tournament, $request->validated()['max_players'])
        );
    }
}
