<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrizeAward extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_PENDING = 'pending';
    const STATUS_AWARDED = 'awarded';

    const CATEGORY_TOURNAMENT_WINNER = 'tournament_winner';
    const CATEGORY_TOURNAMENT_RUNNER_UP = 'tournament_runner_up';
    const CATEGORY_ROUND_ELIMINATION = 'round_elimination';
    const CATEGORY_SCORE_PRIZE = 'score_prize';
    const CATEGORY_PARTICIPATION = 'participation';
    const CATEGORY_MANUAL_ADJUSTMENT = 'manual_adjustment';
    const CATEGORY_CUSTOM = 'custom';

    protected $fillable = [
        'tournament_id', 'match_id', 'round_id', 'player_id', 'prize_id',
        'amount', 'is_ranking', 'category', 'status', 'reason',
        'awarded_by', 'awarded_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_ranking' => 'boolean',
            'awarded_at' => 'datetime',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function match()
    {
        return $this->belongsTo(Match_::class, 'match_id');
    }

    public function round()
    {
        return $this->belongsTo(Round::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function prize()
    {
        return $this->belongsTo(Prize::class);
    }

    public function awardedBy()
    {
        return $this->belongsTo(User::class, 'awarded_by');
    }

    public function scopeRanking($query)
    {
        return $query->where('is_ranking', true);
    }

    public function scopeAwarded($query)
    {
        return $query->where('status', self::STATUS_AWARDED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
