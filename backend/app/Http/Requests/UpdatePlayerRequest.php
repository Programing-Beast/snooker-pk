<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $player = $this->route('player');

        if ($this->user()->hasRole('admin')) {
            return true;
        }

        return $this->user()->player && $this->user()->player->id === $player->id;
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['sometimes', 'string', 'max:255'],
            'country_code' => ['sometimes', 'string', 'size:3'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'photo' => ['sometimes', 'image', 'max:2048'],
        ];

        if ($this->user()->hasRole('admin')) {
            $rules['tier'] = ['sometimes', 'in:pro,amateur'];
            $rules['date_turned_pro'] = ['nullable', 'date'];
            $rules['ranking_points'] = ['sometimes', 'integer', 'min:0'];
            $rules['status'] = ['sometimes', 'in:active,inactive'];
        }

        return $rules;
    }
}
