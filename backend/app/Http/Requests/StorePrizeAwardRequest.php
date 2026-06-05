<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrizeAwardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'player_id' => ['required', 'exists:players,id'],
            'prize_id' => ['nullable', 'exists:prizes,id'],
            'amount' => ['required', 'numeric'],
            'is_ranking' => ['sometimes', 'boolean'],
            'category' => ['required', 'string'],
            'reason' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:pending,awarded'],
        ];
    }
}
