<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustRankingRequest;
use App\Http\Resources\PlayerResource;
use App\Http\Resources\RankingResource;
use App\Services\RankingService;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function __construct(private RankingService $rankingService) {}

    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return RankingResource::collection(
            $this->rankingService->list($request->all())
        );
    }

    public function adjust(AdjustRankingRequest $request): PlayerResource
    {
        $data = $request->validated();

        return new PlayerResource(
            $this->rankingService->manualAdjust($data['player_id'], $data['points'], $data['reason'], $request->user())
        );
    }
}
