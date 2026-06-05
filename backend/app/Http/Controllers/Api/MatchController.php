<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignUmpireRequest;
use App\Http\Requests\UpdateMatchRequest;
use App\Http\Requests\WalkoverRequest;
use App\Http\Resources\MatchResource;
use App\Models\Match_;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatchController extends Controller
{
    public function __construct(private MatchService $matchService) {}

    public function show(Match_ $match): MatchResource
    {
        return new MatchResource($this->matchService->show($match));
    }

    public function update(UpdateMatchRequest $request, Match_ $match): MatchResource
    {
        return new MatchResource(
            $this->matchService->update($match, $request->validated())
        );
    }

    public function assignUmpire(AssignUmpireRequest $request, Match_ $match): MatchResource
    {
        return new MatchResource(
            $this->matchService->assignUmpire($match, $request->validated()['umpire_id'])
        );
    }

    public function walkover(WalkoverRequest $request, Match_ $match): MatchResource
    {
        return new MatchResource(
            $this->matchService->walkover($match, $request->validated()['winner_id'])
        );
    }

    public function complete(Match_ $match): MatchResource
    {
        return new MatchResource($this->matchService->complete($match));
    }

    public function declareWinner(WalkoverRequest $request, Match_ $match): MatchResource
    {
        $data = $request->validated();

        return new MatchResource(
            $this->matchService->declareWinner(
                $match,
                $data['winner_id'],
                $data['score1'] ?? null,
                $data['score2'] ?? null,
            )
        );
    }

    public function board(Match_ $match): MatchResource
    {
        return new MatchResource($this->matchService->board($match));
    }

    public function umpireMatches(): AnonymousResourceCollection
    {
        return MatchResource::collection($this->matchService->umpireMatches(auth()->id()));
    }
}
