<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoundRequest;
use App\Http\Requests\UpdateRoundRequest;
use App\Http\Resources\RoundResource;
use App\Models\Round;
use App\Models\Tournament;
use App\Services\RoundService;
use Illuminate\Http\JsonResponse;

class RoundController extends Controller
{
    public function __construct(private RoundService $roundService) {}

    public function index(Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return RoundResource::collection($this->roundService->list($tournament));
    }

    public function store(StoreRoundRequest $request, Tournament $tournament): JsonResponse
    {
        $round = $this->roundService->store($tournament, $request->validated());

        return (new RoundResource($round))->response()->setStatusCode(201);
    }

    public function show(Round $round): RoundResource
    {
        return new RoundResource($round);
    }

    public function update(UpdateRoundRequest $request, Round $round): RoundResource
    {
        return new RoundResource($this->roundService->update($round, $request->validated()));
    }

    public function destroy(Round $round): JsonResponse
    {
        $this->roundService->delete($round);

        return response()->json(['message' => 'Round deleted.']);
    }
}
