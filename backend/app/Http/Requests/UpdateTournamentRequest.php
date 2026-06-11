<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'edition' => ['nullable', 'string', 'max:100'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('tournaments')->ignore($this->route('tournament'))],
            'type' => ['nullable', 'string', 'max:100'],
            'format' => ['sometimes', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'country_code' => ['nullable', 'string', 'size:3'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'qualifier_info' => ['nullable', 'string'],
            'banner' => ['sometimes', 'image', 'max:5120'],
            'presented_by' => ['nullable', 'string', 'max:255'],
            'prize_pool' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:upcoming,awaiting,postponed,cancelled,live,completed'],
            'entry_status' => ['sometimes', 'in:open,closed'],
            'max_players' => ['nullable', 'integer', 'min:2'],
            'draw_size' => ['nullable', 'integer', 'min:2'],
        ];
    }
}
