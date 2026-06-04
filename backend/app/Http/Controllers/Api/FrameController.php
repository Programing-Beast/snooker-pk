<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFrameRequest;
use App\Http\Requests\UpdateFrameRequest;
use App\Http\Resources\FrameResource;
use App\Models\Frame;
use App\Models\Match_;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;

class FrameController extends Controller
{
    public function __construct(private MatchService $matchService) {}

    public function store(StoreFrameRequest $request, Match_ $match): JsonResponse
    {
        $frame = $this->matchService->createFrame($match, $request->validated());

        return (new FrameResource($frame))->response()->setStatusCode(201);
    }

    public function update(UpdateFrameRequest $request, Frame $frame): FrameResource
    {
        return new FrameResource(
            $this->matchService->updateFrame($frame, $request->validated())
        );
    }
}
