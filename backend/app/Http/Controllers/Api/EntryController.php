<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminAddEntryRequest;
use App\Http\Requests\ApproveRejectEntryRequest;
use App\Http\Requests\ListEntriesRequest;
use App\Http\Requests\RequestEntryRequest;
use App\Http\Requests\SetSeedRequest;
use App\Http\Resources\TournamentEntryResource;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Services\EntryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function __construct(private EntryService $entryService) {}

    public function request(RequestEntryRequest $request): JsonResponse
    {
        $entry = $this->entryService->requestEntry(
            $request->user()->player,
            $request->validated()['tournament_id']
        );

        return (new TournamentEntryResource($entry->load('tournament')))
            ->response()
            ->setStatusCode(201);
    }

    public function approve(ApproveRejectEntryRequest $request, TournamentEntry $entry): TournamentEntryResource
    {
        return new TournamentEntryResource(
            $this->entryService->approve($entry, $request->user())
        );
    }

    public function reject(ApproveRejectEntryRequest $request, TournamentEntry $entry): TournamentEntryResource
    {
        return new TournamentEntryResource(
            $this->entryService->reject($entry, $request->user())
        );
    }

    public function adminAdd(AdminAddEntryRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Bulk add: player_ids array
        if (! empty($data['player_ids'])) {
            $added = $this->entryService->bulkAdminAdd(
                $data['tournament_id'],
                $data['player_ids'],
                $request->user()
            );

            return response()->json([
                'message' => "{$added} player(s) added.",
                'added' => $added,
            ], 201);
        }

        // Single add: player_id
        $entry = $this->entryService->adminAdd(
            $data['tournament_id'],
            $data['player_id'],
            $request->user()
        );

        return (new TournamentEntryResource($entry->load('player')))
            ->response()
            ->setStatusCode(201);
    }

    public function setSeed(SetSeedRequest $request, TournamentEntry $entry): TournamentEntryResource
    {
        return new TournamentEntryResource(
            $this->entryService->setSeed($entry, $request->validated()['seed'] ?? null)
        );
    }

    public function mine(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return TournamentEntryResource::collection(
            $this->entryService->myEntries($request->user()->player)
        );
    }

    public function summary(ListEntriesRequest $request, Tournament $tournament): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return TournamentEntryResource::collection(
            $this->entryService->summary($tournament, $request->validated())
        );
    }
}
