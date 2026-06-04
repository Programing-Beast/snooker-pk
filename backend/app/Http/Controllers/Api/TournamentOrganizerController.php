<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTournamentOrganizerRequest;
use App\Http\Requests\UpdateTournamentOrganizerRequest;
use App\Http\Resources\TournamentOrganizerResource;
use App\Models\Tournament;
use App\Models\TournamentOrganizer;
use App\Services\TournamentOrganizerService;
use Illuminate\Http\JsonResponse;

class TournamentOrganizerController extends Controller
{
    public function __construct(private TournamentOrganizerService $service) {}

    public function index(Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return TournamentOrganizerResource::collection($this->service->list($tournament));
    }

    public function store(StoreTournamentOrganizerRequest $request, Tournament $tournament): JsonResponse
    {
        $organizer = $this->service->store($tournament, $request->validated());

        return (new TournamentOrganizerResource($organizer))->response()->setStatusCode(201);
    }

    public function update(UpdateTournamentOrganizerRequest $request, TournamentOrganizer $organizer): TournamentOrganizerResource
    {
        return new TournamentOrganizerResource($this->service->update($organizer, $request->validated()));
    }

    public function destroy(TournamentOrganizer $organizer): JsonResponse
    {
        $this->service->delete($organizer);

        return response()->json(['message' => 'Organizer removed.']);
    }
}
