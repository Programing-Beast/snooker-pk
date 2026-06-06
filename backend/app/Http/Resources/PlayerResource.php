<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isPrivileged = $request->user()?->hasRole('admin') || $request->user()?->player?->id === $this->id;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'country_code' => $this->country_code,
            'city' => $this->city,
            'tier' => $this->tier,
            'photo_path' => $this->photo_path,
            'phones' => $this->when(
                $isPrivileged,
                PlayerPhoneResource::collection($this->whenLoaded('phones'))
            ),
            'address' => $this->when($isPrivileged, $this->address),
            'bio' => $this->bio,
            'date_turned_pro' => $this->date_turned_pro?->toDateString(),
            'ranking_points' => $this->ranking_points,
            'matches_played' => $this->whenHas('matches_played'),
            'wins' => $this->whenHas('wins'),
            'win_rate' => $this->whenHas('win_rate'),
            'titles_count' => $this->whenHas('titles_count'),
            'high_break' => $this->whenHas('high_break'),
            'total_points' => $this->whenHas('total_points'),
            'avg_break' => $this->whenHas('avg_break'),
            'breaks_50' => $this->whenHas('breaks_50'),
            'breaks_100' => $this->whenHas('breaks_100'),
            'breaks_147' => $this->whenHas('breaks_147'),
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
