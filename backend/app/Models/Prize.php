<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prize extends Model
{
    use HasFactory, SoftDeletes;

    const TYPE_WINNER = 'winner';
    const TYPE_RUNNER_UP = 'runner_up';
    const TYPE_CUSTOM = 'custom';

    protected $fillable = [
        'tournament_id', 'position_label', 'amount',
        'count', 'note', 'sort_order', 'is_highlight',
        'type', 'ranking_prize', 'multiple', 'score_threshold',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'count' => 'integer',
            'sort_order' => 'integer',
            'is_highlight' => 'boolean',
            'ranking_prize' => 'boolean',
            'multiple' => 'boolean',
            'score_threshold' => 'integer',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function prizeAwards()
    {
        return $this->hasMany(PrizeAward::class);
    }

    public function isSystemPrize(): bool
    {
        return in_array($this->type, [self::TYPE_WINNER, self::TYPE_RUNNER_UP]);
    }
}
