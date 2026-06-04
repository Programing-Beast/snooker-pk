<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalkoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'winner_id' => ['required', 'exists:players,id'],
            'score1' => ['sometimes', 'integer', 'min:0'],
            'score2' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
