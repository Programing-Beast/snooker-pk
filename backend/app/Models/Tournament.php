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
        'has_qualifiers', 'qualifying_slots',
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
            'has_qualifiers' => 'boolean',
            'qualifying_slots' => 'integer',
        ];
    }

    public function qualifierRounds()
    {
        return $this->hasMany(Round::class)->where('is_qualifier', true)->orderBy('sort_order');
    }

    public function mainDrawRounds()
    {
        return $this->hasMany(Round::class)->where('is_qualifier', false)->orderBy('sort_order');
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

    /**
     * Derive tournament status from actual match state.
     *
     * completed  → winner has been determined
     * live       → at least one match has been played/is live
     * awaiting   → start date has passed but no matches played yet
     * upcoming   → tournament hasn't started
     *
     * Admin can override via the status column (e.g. postponed, cancelled).
     * Overrides only apply when the tournament is not live/completed.
     */
    public function computedStatus(): string
    {
        if ($this->winner_id) {
            return 'completed';
        }

        // Use pre-loaded count if available (set via withCount)
        $isLive = false;
        if (isset($this->attributes['active_matches_count'])) {
            $isLive = $this->attributes['active_matches_count'] > 0;
        } else {
            $isLive = $this->matches()
                ->whereIn('status', ['live', 'completed'])
                ->exists();
        }

        if ($isLive) {
            return 'live';
        }

        // No winner, no active matches — check for admin override
        if ($this->status && ! in_array($this->status, ['upcoming', 'live', 'completed'])) {
            return $this->status;
        }

        // Auto-detect: start date is in the past → awaiting
        if ($this->start_date && $this->start_date->isPast()) {
            return 'awaiting';
        }

        return 'upcoming';
    }

    public function prizeAwards()
    {
        return $this->hasMany(PrizeAward::class);
    }
}
