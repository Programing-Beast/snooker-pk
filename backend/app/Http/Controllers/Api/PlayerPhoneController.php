<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlayerPhoneRequest;
use App\Http\Requests\UpdatePlayerPhoneRequest;
use App\Http\Resources\PlayerPhoneResource;
use App\Models\Player;
use App\Models\PlayerPhone;
use App\Services\PlayerPhoneService;
use Illuminate\Http\JsonResponse;

class PlayerPhoneController extends Controller
{
    public function __construct(private PlayerPhoneService $playerPhoneService) {}

    public function index(Player $player): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return PlayerPhoneResource::collection($this->playerPhoneService->list($player));
    }

    public function store(StorePlayerPhoneRequest $request, Player $player): JsonResponse
    {
        $phone = $this->playerPhoneService->store($player, $request->validated());

        return (new PlayerPhoneResource($phone))->response()->setStatusCode(201);
    }

    public function update(UpdatePlayerPhoneRequest $request, PlayerPhone $playerPhone): PlayerPhoneResource
    {
        return new PlayerPhoneResource($this->playerPhoneService->update($playerPhone, $request->validated()));
    }

    public function destroy(PlayerPhone $playerPhone): JsonResponse
    {
        $this->playerPhoneService->delete($playerPhone);

        return response()->json(['message' => 'Phone deleted.']);
    }
}
