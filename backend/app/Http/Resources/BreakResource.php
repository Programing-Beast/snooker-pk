<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BreakResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'frame_id' => $this->frame_id,
            'player_id' => $this->player_id,
            'player' => new PlayerResource($this->whenLoaded('player')),
            'points' => $this->points,
            'balls' => $this->balls,
            'fouls' => $this->fouls,
            'foul_points' => $this->foul_points,
            'duration_seconds' => $this->duration_seconds,
            'sort_order' => $this->sort_order,
            'is_foul_turn' => $this->is_foul_turn,
            'created_at' => $this->created_at,
        ];
    }
}
