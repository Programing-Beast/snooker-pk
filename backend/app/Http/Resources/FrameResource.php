<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FrameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'match_id' => $this->match_id,
            'frame_no' => $this->frame_no,
            'score1' => $this->score1,
            'score2' => $this->score2,
            'winner_id' => $this->winner_id,
            'high_break_value' => $this->high_break_value,
            'high_break_player_id' => $this->high_break_player_id,
            'status' => $this->status,
            'breaker_id' => $this->breaker_id,
            'breaks' => BreakResource::collection($this->whenLoaded('breaks')),
            'created_at' => $this->created_at,
        ];
    }
}
