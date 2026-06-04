<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Frame extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'match_id', 'frame_no', 'score1', 'score2',
        'winner_id', 'high_break_value', 'high_break_player_id',
        'status', 'breaker_id',
    ];

    protected function casts(): array
    {
        return [
            'frame_no' => 'integer',
            'score1' => 'integer',
            'score2' => 'integer',
            'high_break_value' => 'integer',
        ];
    }

    public function match()
    {
        return $this->belongsTo(Match_::class, 'match_id');
    }

    public function winner()
    {
        return $this->belongsTo(Player::class, 'winner_id');
    }

    public function highBreakPlayer()
    {
        return $this->belongsTo(Player::class, 'high_break_player_id');
    }

    public function breaker()
    {
        return $this->belongsTo(Player::class, 'breaker_id');
    }

    public function breaks()
    {
        return $this->hasMany(Break_::class, 'frame_id')->orderBy('sort_order');
    }
}
