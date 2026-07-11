<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'sub_label' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_qualifier' => ['sometimes', 'boolean'],
            'frames_to_win' => ['sometimes', 'integer', 'min:1'],
            'reds_count' => ['sometimes', 'integer', 'in:1,6,10,15'],
            'draw_mode' => ['nullable', 'in:fixed,random'],
            'elimination_prize' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
