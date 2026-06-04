<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListTournamentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'in:upcoming,live,completed'],
            'type' => ['sometimes', 'string', 'max:100'],
            'sort_by' => ['sometimes', 'in:name,start_date,created_at,prize_pool'],
            'sort_dir' => ['sometimes', 'in:asc,desc'],
            'per_page' => Pagination::rules(),
        ];
    }
}
