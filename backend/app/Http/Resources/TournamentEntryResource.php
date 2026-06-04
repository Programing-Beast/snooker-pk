<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'player_id' => $this->player_id,
            'status' => $this->status,
            'source' => $this->source,
            'seed' => $this->seed,
            'requested_at' => $this->requested_at,
            'decided_at' => $this->decided_at,
            'decided_by' => $this->decided_by,
            'player' => new PlayerResource($this->whenLoaded('player')),
            'tournament' => new TournamentResource($this->whenLoaded('tournament')),
            'created_at' => $this->created_at,
        ];
    }
}
