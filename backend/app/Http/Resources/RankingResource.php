<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RankingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'country_code' => $this->country_code,
            'city' => $this->city,
            'tier' => $this->tier,
            'photo_path' => $this->photo_path,
            'ranking_points' => $this->ranking_points,
        ];
    }
}
