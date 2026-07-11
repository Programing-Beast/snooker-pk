<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Round extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tournament_id', 'name', 'sub_label',
        'sort_order', 'is_qualifier', 'frames_to_win', 'reds_count', 'draw_mode', 'generated_at',
        'elimination_prize',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_qualifier' => 'boolean',
            'frames_to_win' => 'integer',
            'reds_count' => 'integer',
            'generated_at' => 'datetime',
            'elimination_prize' => 'decimal:2',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function matches()
    {
        return $this->hasMany(Match_::class)->orderBy('position');
    }
}
