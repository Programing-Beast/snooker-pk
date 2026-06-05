<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'round_id' => $this->round_id,
            'position' => $this->position,
            'player1' => new PlayerResource($this->whenLoaded('player1')),
            'player2' => new PlayerResource($this->whenLoaded('player2')),
            'score1' => $this->score1,
            'score2' => $this->score2,
            'player1_frames' => $this->score1,
            'player2_frames' => $this->score2,
            'is_bye' => $this->status === 'bye',
            'is_walkover' => $this->status === 'walkover',
            'winner' => new PlayerResource($this->whenLoaded('winner')),
            'status' => $this->status,
            'mode' => $this->mode,
            'umpire' => new UserResource($this->whenLoaded('umpire')),
            'table_no' => $this->table_no,
            'scheduled_at' => $this->scheduled_at,
            'scheduled_time' => $this->scheduled_at?->format('H:i'),
            'youtube_url' => $this->youtube_url,
            'facebook_url' => $this->facebook_url,
            'current_frame_no' => $this->current_frame_no,
            'current_frame' => $this->current_frame_no,
            'note' => $this->note,
            'tournament' => new TournamentResource($this->whenLoaded('tournament')),
            'round' => new RoundResource($this->whenLoaded('round')),
            'frames' => FrameResource::collection($this->whenLoaded('frames')),
            'created_at' => $this->created_at,
        ];
    }
}
