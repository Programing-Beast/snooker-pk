<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrizeAwardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'match_id' => $this->match_id,
            'round_id' => $this->round_id,
            'player_id' => $this->player_id,
            'prize_id' => $this->prize_id,
            'amount' => $this->amount,
            'is_ranking' => $this->is_ranking,
            'category' => $this->category,
            'status' => $this->status,
            'reason' => $this->reason,
            'awarded_by' => $this->awarded_by,
            'awarded_at' => $this->awarded_at,
            'created_at' => $this->created_at,
            'player' => new PlayerResource($this->whenLoaded('player')),
            'prize' => new PrizeResource($this->whenLoaded('prize')),
            'tournament' => $this->whenLoaded('tournament'),
            'awardedBy' => $this->whenLoaded('awardedBy'),
        ];
    }
}
