<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Break_ extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'breaks';

    protected $fillable = [
        'frame_id', 'player_id', 'points', 'balls',
        'fouls', 'foul_points', 'duration_seconds',
        'sort_order', 'is_foul_turn',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'balls' => 'array',
            'fouls' => 'integer',
            'foul_points' => 'integer',
            'duration_seconds' => 'integer',
            'sort_order' => 'integer',
            'is_foul_turn' => 'boolean',
        ];
    }

    public function frame()
    {
        return $this->belongsTo(Frame::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
