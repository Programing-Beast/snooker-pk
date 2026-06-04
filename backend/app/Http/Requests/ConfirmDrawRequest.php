<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmDrawRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'round_id' => ['required', 'exists:rounds,id'],
        ];
    }
}
