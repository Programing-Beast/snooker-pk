<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->player !== null;
    }

    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'exists:tournaments,id'],
        ];
    }
}
