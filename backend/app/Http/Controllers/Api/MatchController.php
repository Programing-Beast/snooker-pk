<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignUmpireRequest;
use App\Http\Requests\UpdateMatchRequest;
use App\Http\Requests\WalkoverRequest;
use App\Http\Resources\MatchResource;
use App\Models\Match_;
use App\Models\Round;
use App\Models\Tournament;
use App\Services\DrawService;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatchController extends Controller
{
    public function __construct(
        private MatchService $matchService,
        private DrawService $drawService,
    ) {}

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

    public function storeQualifierMatch(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tournament_id' => ['required', 'integer', 'exists:tournaments,id'],
            'round_id' => ['required', 'integer', 'exists:rounds,id'],
            'player1_id' => ['required', 'integer', 'exists:players,id'],
            'player2_id' => ['required', 'integer', 'exists:players,id', 'different:player1_id'],
        ]);

        $tournament = Tournament::findOrFail($data['tournament_id']);
        $round = Round::findOrFail($data['round_id']);

        $match = $this->drawService->createQualifierMatch(
            $tournament,
            $round,
            $data['player1_id'],
            $data['player2_id'],
        );

        return (new MatchResource($match->load(['player1', 'player2'])))
            ->response()
            ->setStatusCode(201);
    }

    public function generateQualifierDraw(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tournament_id' => ['required', 'integer', 'exists:tournaments,id'],
            'round_id' => ['required', 'integer', 'exists:rounds,id'],
        ]);

        $tournament = Tournament::findOrFail($data['tournament_id']);
        $round = Round::findOrFail($data['round_id']);

        $matchesCreated = $this->drawService->generateQualifierDraw($tournament, $round);

        return response()->json([
            'message' => "{$matchesCreated} match(es) created.",
            'matches_created' => $matchesCreated,
        ], 201);
    }

    public function destroyQualifierMatch(Match_ $match): JsonResponse
    {
        $this->drawService->deleteQualifierMatch($match);

        return response()->json(['message' => 'Qualifier match deleted.']);
    }
}
