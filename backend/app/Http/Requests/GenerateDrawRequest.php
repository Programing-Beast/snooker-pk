<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateDrawRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'round_id' => ['sometimes', 'exists:rounds,id'],
            'pairings' => ['sometimes', 'array', 'min:1'],
            'pairings.*.player1_id' => ['required_with:pairings', 'exists:players,id'],
            'pairings.*.player2_id' => ['required_with:pairings', 'exists:players,id'],
        ];
    }
}
