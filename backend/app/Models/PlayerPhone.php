<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerPhone extends Model
{
    protected $fillable = [
        'player_id',
        'phone',
        'label',
        'is_whatsapp',
    ];

    protected function casts(): array
    {
        return [
            'is_whatsapp' => 'boolean',
        ];
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
