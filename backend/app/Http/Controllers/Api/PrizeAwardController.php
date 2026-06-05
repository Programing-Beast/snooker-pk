<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkPrizeAwardRequest;
use App\Http\Requests\StorePrizeAwardRequest;
use App\Http\Requests\UpdatePrizeAwardRequest;
use App\Http\Resources\PrizeAwardResource;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use App\Models\PrizeAward;
use App\Models\Tournament;
use App\Services\PrizeAwardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrizeAwardController extends Controller
{
    public function __construct(private PrizeAwardService $prizeAwardService) {}

    public function index(Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return PrizeAwardResource::collection(
            $this->prizeAwardService->listForTournament($tournament->id)
        );
    }

    public function store(StorePrizeAwardRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['awarded_by'] = $request->user()->id;

        $award = $this->prizeAwardService->award($data);

        return (new PrizeAwardResource($award->load(['player', 'prize'])))->response()->setStatusCode(201);
    }

    public function bulk(BulkPrizeAwardRequest $request): JsonResponse
    {
        $data = $request->validated();

        $this->prizeAwardService->bulkAward(
            $data['tournament_id'],
            $data['prize_id'],
            $data['player_ids'],
            $request->user()->id,
        );

        return response()->json(['message' => 'Prizes awarded successfully.']);
    }

    public function update(UpdatePrizeAwardRequest $request, PrizeAward $prizeAward): PrizeAwardResource
    {
        if ($request->status === PrizeAward::STATUS_AWARDED && $prizeAward->status === PrizeAward::STATUS_PENDING) {
            $award = $this->prizeAwardService->confirmAward($prizeAward, $request->user());
        } else {
            $prizeAward->update($request->validated());
            $award = $prizeAward->fresh();
        }

        return new PrizeAwardResource($award->load(['player', 'prize']));
    }

    public function playerHistory(Player $player): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return PrizeAwardResource::collection(
            $this->prizeAwardService->listForPlayer($player->id)
        );
    }

    public function eligiblePlayers(Tournament $tournament, Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $excludeQualifiers = $request->boolean('exclude_qualifiers', false);

        return PlayerResource::collection(
            $this->prizeAwardService->getEligiblePlayers($tournament->id, $excludeQualifiers)
        );
    }
}
