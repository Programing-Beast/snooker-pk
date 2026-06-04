<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'in:scheduled,live,completed,bye,walkover'],
            'mode' => ['sometimes', 'in:singles,doubles,century'],
            'table_no' => ['nullable', 'string', 'max:50'],
            'scheduled_at' => ['nullable', 'date'],
            'score1' => ['sometimes', 'integer', 'min:0'],
            'score2' => ['sometimes', 'integer', 'min:0'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'note' => ['nullable', 'string'],
        ];
    }
}
