<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TournamentEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tournament_id', 'player_id', 'status', 'source',
        'seed', 'requested_at', 'decided_at', 'decided_by',
    ];

    protected function casts(): array
    {
        return [
            'seed' => 'integer',
            'requested_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function decidedByUser()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
