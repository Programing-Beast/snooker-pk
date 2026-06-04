<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmDrawRequest;
use App\Http\Requests\GenerateDrawRequest;
use App\Http\Resources\MatchResource;
use App\Models\Round;
use App\Models\Tournament;
use App\Services\DrawService;
use Illuminate\Http\JsonResponse;

class DrawController extends Controller
{
    public function __construct(private DrawService $drawService) {}

    public function preview(Tournament $tournament): JsonResponse
    {
        $stats = $this->drawService->previewDraw($tournament);

        $firstRound = $tournament->rounds()->orderBy('sort_order')->first();
        $matches = $firstRound
            ? MatchResource::collection($firstRound->matches()->with(['player1', 'player2'])->orderBy('position')->get())
            : [];

        return response()->json([
            'data' => array_merge($stats, ['matches' => $matches]),
        ]);
    }

    public function generate(GenerateDrawRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $tournament = Tournament::findOrFail($validated['tournament_id']);
        $round = Round::findOrFail($validated['round_id']);

        $pairings = $validated['pairings'] ?? null;

        $this->drawService->generateDraw($tournament, $round, $pairings);

        $matches = MatchResource::collection(
            $round->matches()->with(['player1', 'player2'])
                ->where('status', '!=', 'bye')->orderBy('position')->get()
        );

        $byes = MatchResource::collection(
            $round->matches()->with(['player1', 'player2'])
                ->where('status', 'bye')->orderBy('position')->get()
        );

        return response()->json([
            'message' => 'Draw generated successfully.',
            'data' => [
                'matches' => $matches,
                'byes' => $byes,
            ],
        ]);
    }

    public function confirm(ConfirmDrawRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $tournament = Tournament::findOrFail($validated['tournament_id']);
        $round = Round::findOrFail($validated['round_id']);

        $this->drawService->confirmDraw($tournament, $round);

        return response()->json([
            'message' => 'Draw confirmed.',
        ]);
    }

    public function reroll(GenerateDrawRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $tournament = Tournament::findOrFail($validated['tournament_id']);
        $round = Round::findOrFail($validated['round_id']);

        $this->drawService->rerollDraw($tournament, $round);

        $matches = MatchResource::collection(
            $round->matches()->with(['player1', 'player2'])->orderBy('position')->get()
        );

        return response()->json([
            'message' => 'Draw re-rolled successfully.',
            'data' => ['matches' => $matches],
        ]);
    }
}
