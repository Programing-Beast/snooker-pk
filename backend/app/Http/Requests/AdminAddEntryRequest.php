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
            'player_id' => ['required', 'exists:players,id'],
        ];
    }
}
