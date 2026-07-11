<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoundResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'name' => $this->name,
            'sub_label' => $this->sub_label,
            'sort_order' => $this->sort_order,
            'is_qualifier' => (bool) $this->is_qualifier,
            'frames_to_win' => $this->frames_to_win,
            'reds_count' => $this->reds_count,
            'draw_mode' => $this->draw_mode,
            'generated_at' => $this->generated_at,
            'elimination_prize' => $this->elimination_prize,
            'matches' => MatchResource::collection($this->whenLoaded('matches')),
        ];
    }
}
