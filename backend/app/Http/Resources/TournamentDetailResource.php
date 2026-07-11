<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentDetailResource extends JsonResource
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
            'description' => $this->description,
            'qualifier_info' => $this->qualifier_info,
            'presented_by' => $this->presented_by,
            'prize_pool' => $this->prize_pool,
            'status' => $this->computedStatus(),
            'entry_status' => $this->entry_status,
            'max_players' => $this->max_players,
            'approved_entries_count' => $this->approved_entries_count ?? $this->approvedEntries()->count(),
            'draw_size' => $this->draw_size,
            'has_qualifiers' => (bool) $this->has_qualifiers,
            'qualifying_slots' => $this->qualifying_slots,
            'winner_id' => $this->winner_id,
            'runner_up_id' => $this->runner_up_id,
            'winner' => new PlayerResource($this->whenLoaded('winner')),
            'runner_up' => new PlayerResource($this->whenLoaded('runnerUp')),
            'prizes' => PrizeResource::collection($this->whenLoaded('prizes')),
            'organizers' => TournamentOrganizerResource::collection($this->whenLoaded('organizers')),
            'rounds' => RoundResource::collection($this->whenLoaded('rounds')),
            'created_at' => $this->created_at,
        ];
    }
}
