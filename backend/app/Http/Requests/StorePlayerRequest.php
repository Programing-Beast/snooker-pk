<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'country_code' => ['sometimes', 'string', 'size:3'],
            'city' => ['nullable', 'string', 'max:255'],
            'tier' => ['sometimes', 'in:pro,amateur'],
            'address' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'date_turned_pro' => ['nullable', 'date'],
            'ranking_points' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
