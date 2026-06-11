<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'edition' => $this->edition,
            'slug' => $this->slug,
            'type' => $this->type,
            'format' => $this->format,
            'venue' => $this->venue,
            'city' => $this->city,
            'country_code' => $this->country_code,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'start_time' => $this->start_time,
            'cover_path' => $this->cover_path,
            'banner_path' => $this->banner_path,
            'presented_by' => $this->presented_by,
            'prize_pool' => $this->prize_pool,
            'status' => $this->computedStatus(),
            'entry_status' => $this->entry_status,
            'max_players' => $this->max_players,
            'draw_size' => $this->draw_size,
            'winner_id' => $this->winner_id,
            'runner_up_id' => $this->runner_up_id,
            'winner' => new PlayerResource($this->whenLoaded('winner')),
            'runner_up' => new PlayerResource($this->whenLoaded('runnerUp')),
            'created_at' => $this->created_at,
        ];
    }
}
