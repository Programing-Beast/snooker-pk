<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListEntriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'in:pending,approved,rejected'],
            'per_page' => Pagination::rules(),
        ];
    }
}
