<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerPhoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'player_id' => $this->player_id,
            'phone' => $this->phone,
            'label' => $this->label,
            'is_whatsapp' => $this->is_whatsapp,
            'created_at' => $this->created_at,
        ];
    }
}
