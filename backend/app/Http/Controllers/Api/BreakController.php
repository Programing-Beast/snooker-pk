<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBreakRequest;
use App\Http\Requests\UpdateBreakRequest;
use App\Http\Resources\BreakResource;
use App\Models\Break_;
use App\Models\Frame;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;

class BreakController extends Controller
{
    public function __construct(private MatchService $matchService) {}

    public function store(StoreBreakRequest $request, Frame $frame): JsonResponse
    {
        $break = $this->matchService->createBreak($frame, $request->validated());

        return (new BreakResource($break))->response()->setStatusCode(201);
    }

    public function update(UpdateBreakRequest $request, Break_ $break_): BreakResource
    {
        return new BreakResource(
            $this->matchService->updateBreak($break_, $request->validated())
        );
    }

    public function destroy(Break_ $break_): JsonResponse
    {
        $this->matchService->deleteBreak($break_);

        return response()->json(['message' => 'Break deleted.']);
    }
}
