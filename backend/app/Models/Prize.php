<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prize extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tournament_id', 'position_label', 'amount',
        'count', 'note', 'sort_order', 'is_highlight',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'count' => 'integer',
            'sort_order' => 'integer',
            'is_highlight' => 'boolean',
        ];
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }
}
