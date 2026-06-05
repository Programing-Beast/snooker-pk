<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrizeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'position_label' => $this->position_label,
            'amount' => $this->amount,
            'count' => $this->count,
            'note' => $this->note,
            'sort_order' => $this->sort_order,
            'is_highlight' => $this->is_highlight,
            'type' => $this->type,
            'ranking_prize' => $this->ranking_prize,
            'multiple' => $this->multiple,
            'score_threshold' => $this->score_threshold,
        ];
    }
}
