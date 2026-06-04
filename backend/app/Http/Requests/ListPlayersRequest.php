<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListPlayersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'tier' => ['sometimes', 'in:pro,amateur'],
            'status' => ['sometimes', 'in:active,inactive'],
            'country_code' => ['sometimes', 'string', 'size:3'],
            'sort_by' => ['sometimes', 'in:name,ranking_points,created_at'],
            'sort_dir' => ['sometimes', 'in:asc,desc'],
            'per_page' => Pagination::rules(),
        ];
    }
}
