<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentOrganizerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'user_id' => $this->user_id,
            'role' => $this->role,
            'sort_order' => $this->sort_order,
            'user' => $this->whenLoaded('user', function () {
                $user = $this->user;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'player' => $user->player ? [
                        'id' => $user->player->id,
                        'name' => $user->player->name,
                        'photo_path' => $user->player->photo_path,
                        'phones' => $user->player->phones->map(fn ($ph) => [
                            'id' => $ph->id,
                            'phone' => $ph->phone,
                            'label' => $ph->label,
                        ])->values(),
                    ] : null,
                ];
            }),
        ];
    }
}
