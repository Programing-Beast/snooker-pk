<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmDrawRequest;
use App\Http\Requests\GenerateDrawRequest;
use App\Http\Resources\MatchResource;
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
        $tournament = Tournament::findOrFail($request->validated()['tournament_id']);
        $this->drawService->generateDraw($tournament);

        $firstRound = $tournament->rounds()->orderBy('sort_order')->first();
        $matches = MatchResource::collection(
            $firstRound->matches()->with(['player1', 'player2'])->orderBy('position')->get()
        );

        return response()->json([
            'message' => 'Draw generated successfully.',
            'data' => ['matches' => $matches],
        ]);
    }

    public function confirm(ConfirmDrawRequest $request): JsonResponse
    {
        $tournament = Tournament::findOrFail($request->validated()['tournament_id']);
        $this->drawService->confirmDraw($tournament);

        return response()->json([
            'message' => 'Draw confirmed.',
        ]);
    }

    public function reroll(GenerateDrawRequest $request): JsonResponse
    {
        $tournament = Tournament::findOrFail($request->validated()['tournament_id']);
        $this->drawService->rerollDraw($tournament);

        $firstRound = $tournament->rounds()->orderBy('sort_order')->first();
        $matches = MatchResource::collection(
            $firstRound->matches()->with(['player1', 'player2'])->orderBy('position')->get()
        );

        return response()->json([
            'message' => 'Draw re-rolled successfully.',
            'data' => ['matches' => $matches],
        ]);
    }
}
