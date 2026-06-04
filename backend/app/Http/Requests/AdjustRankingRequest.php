<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustRankingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'player_id' => ['required', 'exists:players,id'],
            'points' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
