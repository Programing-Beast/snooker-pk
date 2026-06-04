<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTournamentOrganizerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        $tournamentId = $this->route('tournament')->id;

        return [
            'user_id' => [
                'required',
                'exists:users,id',
                "unique:tournament_organizers,user_id,NULL,id,tournament_id,{$tournamentId}",
            ],
            'role' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer'],
        ];
    }
}
