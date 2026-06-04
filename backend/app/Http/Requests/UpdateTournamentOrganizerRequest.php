<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTournamentOrganizerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer'],
        ];
    }
}
