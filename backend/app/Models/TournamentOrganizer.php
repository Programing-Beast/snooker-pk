<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TournamentOrganizer extends Model
{
    protected $fillable = [
        'tournament_id', 'user_id', 'role', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
