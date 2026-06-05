<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Match_ extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'matches';

    protected $fillable = [
        'tournament_id', 'round_id', 'position',
        'player1_id', 'player2_id', 'score1', 'score2',
        'winner_id', 'status', 'mode', 'umpire_id',
        'table_no', 'scheduled_at', 'video_url',
        'current_frame_no', 'note',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'score1' => 'integer',
            'score2' => 'integer',
            'current_frame_no' => 'integer',
            'scheduled_at' => 'datetime',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function round()
    {
        return $this->belongsTo(Round::class);
    }

    public function player1()
    {
        return $this->belongsTo(Player::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(Player::class, 'player2_id');
    }

    public function winner()
    {
        return $this->belongsTo(Player::class, 'winner_id');
    }

    public function umpire()
    {
        return $this->belongsTo(User::class, 'umpire_id');
    }

    public function frames()
    {
        return $this->hasMany(Frame::class, 'match_id')->orderBy('frame_no');
    }

    public function prizeAwards()
    {
        return $this->hasMany(PrizeAward::class, 'match_id');
    }
}
