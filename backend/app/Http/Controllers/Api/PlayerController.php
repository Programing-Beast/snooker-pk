<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListPlayersRequest;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\MatchResource;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use App\Services\PlayerService;

class PlayerController extends Controller
{
    public function __construct(private PlayerService $playerService) {}

    public function index(ListPlayersRequest $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return PlayerResource::collection(
            $this->playerService->list($request->validated())
        );
    }

    public function show(Player $player): PlayerResource
    {
        return new PlayerResource($this->playerService->show($player));
    }

    public function store(StorePlayerRequest $request): \Illuminate\Http\JsonResponse
    {
        $player = $this->playerService->create($request->validated());

        return (new PlayerResource($player))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePlayerRequest $request, Player $player): PlayerResource
    {
        return new PlayerResource(
            $this->playerService->update($player, $request->validated())
        );
    }

    public function history(Player $player): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return MatchResource::collection(
            $this->playerService->history($player, request()->all())
        );
    }

    public function upcoming(Player $player): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return MatchResource::collection(
            $this->playerService->upcoming($player, request()->all())
        );
    }
}
