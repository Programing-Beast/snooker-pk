<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tournament extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'edition', 'slug', 'type', 'format',
        'venue', 'city', 'country_code',
        'start_date', 'end_date', 'start_time',
        'cover_path', 'banner_path', 'description', 'qualifier_info',
        'presented_by', 'prize_pool',
        'status', 'entry_status', 'max_players', 'draw_size',
        'winner_id', 'runner_up_id',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'prize_pool' => 'decimal:2',
            'max_players' => 'integer',
            'draw_size' => 'integer',
        ];
    }

    public function winner()
    {
        return $this->belongsTo(Player::class, 'winner_id');
    }

    public function runnerUp()
    {
        return $this->belongsTo(Player::class, 'runner_up_id');
    }

    public function prizes()
    {
        return $this->hasMany(Prize::class)->orderBy('sort_order');
    }

    public function organizers()
    {
        return $this->hasMany(TournamentOrganizer::class)->orderBy('sort_order');
    }

    public function entries()
    {
        return $this->hasMany(TournamentEntry::class);
    }

    public function rounds()
    {
        return $this->hasMany(Round::class)->orderBy('sort_order');
    }

    public function matches()
    {
        return $this->hasMany(Match_::class);
    }

    public function approvedEntries()
    {
        return $this->entries()->where('status', 'approved');
    }
}
