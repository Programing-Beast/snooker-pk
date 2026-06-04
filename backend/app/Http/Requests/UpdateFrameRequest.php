<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFrameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin') || $this->user()->hasRole('umpire');
    }

    public function rules(): array
    {
        return [
            'winner_id' => ['nullable', 'exists:players,id'],
            'status' => ['sometimes', 'in:in_progress,completed'],
            'breaker_id' => ['nullable', 'exists:players,id'],
        ];
    }
}
