<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'edition' => ['nullable', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:255', 'unique:tournaments,slug'],
            'type' => ['nullable', 'string', 'max:100'],
            'format' => ['sometimes', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country_code' => ['nullable', 'string', 'size:3'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'qualifier_info' => ['nullable', 'string'],
            'banner' => ['sometimes', 'image', 'max:5120'],
            'presented_by' => ['nullable', 'string', 'max:255'],
            'prize_pool' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:upcoming,live,completed'],
            'entry_status' => ['sometimes', 'in:open,closed'],
            'max_players' => ['nullable', 'integer', 'min:2'],
            'draw_size' => ['nullable', 'integer', 'min:2'],
            'has_qualifiers' => ['sometimes', 'boolean'],
            'qualifying_slots' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
