<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminAddEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'player_id' => ['required_without:player_ids', 'exists:players,id'],
            'player_ids' => ['required_without:player_id', 'array', 'min:1'],
            'player_ids.*' => ['exists:players,id'],
        ];
    }
}
