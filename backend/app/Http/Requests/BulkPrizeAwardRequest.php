<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkPrizeAwardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'prize_id' => ['required', 'exists:prizes,id'],
            'player_ids' => ['required', 'array', 'min:1'],
            'player_ids.*' => ['exists:players,id'],
            'exclude_qualifiers' => ['sometimes', 'boolean'],
        ];
    }
}
