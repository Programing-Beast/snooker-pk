<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignUmpireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'umpire_id' => ['required', 'exists:users,id'],
        ];
    }
}
