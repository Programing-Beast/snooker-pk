<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'country_code', 'city', 'tier',
        'photo_path', 'address', 'bio',
        'date_turned_pro', 'ranking_points', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date_turned_pro' => 'date',
            'ranking_points' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function phones()
    {
        return $this->hasMany(PlayerPhone::class);
    }

    public function entries()
    {
        return $this->hasMany(TournamentEntry::class);
    }

    public function matchesAsPlayer1()
    {
        return $this->hasMany(Match_::class, 'player1_id');
    }

    public function matchesAsPlayer2()
    {
        return $this->hasMany(Match_::class, 'player2_id');
    }

    public function prizeAwards()
    {
        return $this->hasMany(PrizeAward::class);
    }

    public function recalculateRankingPoints(): void
    {
        $this->update([
            'ranking_points' => (int) $this->prizeAwards()
                ->where('is_ranking', true)
                ->where('status', PrizeAward::STATUS_AWARDED)
                ->sum('amount'),
        ]);
    }
}
