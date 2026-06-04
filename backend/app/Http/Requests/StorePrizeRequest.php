<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'position_label' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'count' => ['sometimes', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_highlight' => ['sometimes', 'boolean'],
        ];
    }
}
