<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFrameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin') || $this->user()->hasRole('umpire');
    }

    public function rules(): array
    {
        return [
            'frame_no' => ['sometimes', 'integer', 'min:1'],
            'breaker_id' => ['nullable', 'exists:players,id'],
            'status' => ['sometimes', 'in:in_progress,completed'],
        ];
    }
}
