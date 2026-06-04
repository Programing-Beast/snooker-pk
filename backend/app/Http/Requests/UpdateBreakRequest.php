<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBreakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin') || $this->user()->hasRole('umpire');
    }

    public function rules(): array
    {
        return [
            'points' => ['sometimes', 'integer', 'min:0'],
            'balls' => ['nullable', 'array'],
            'fouls' => ['sometimes', 'integer', 'min:0'],
            'foul_points' => ['sometimes', 'integer', 'min:0'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_foul_turn' => ['sometimes', 'boolean'],
        ];
    }
}
