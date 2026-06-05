<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrizeRequest;
use App\Http\Requests\UpdatePrizeRequest;
use App\Http\Resources\PrizeResource;
use App\Models\Prize;
use App\Models\Tournament;
use App\Services\PrizeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PrizeController extends Controller
{
    public function __construct(private PrizeService $prizeService) {}

    public function index(Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return PrizeResource::collection($this->prizeService->list($tournament));
    }

    public function store(StorePrizeRequest $request, Tournament $tournament): JsonResponse
    {
        $prize = $this->prizeService->store($tournament, $request->validated());

        return (new PrizeResource($prize))->response()->setStatusCode(201);
    }

    public function show(Prize $prize): PrizeResource
    {
        return new PrizeResource($prize);
    }

    public function update(UpdatePrizeRequest $request, Prize $prize): PrizeResource
    {
        return new PrizeResource($this->prizeService->update($prize, $request->validated()));
    }

    public function destroy(Prize $prize): JsonResponse
    {
        $this->prizeService->delete($prize);

        return response()->json(['message' => 'Prize deleted.']);
    }
}
