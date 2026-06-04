<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlayerPhoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        $playerPhone = $this->route('playerPhone');

        if ($this->user()->hasRole('admin')) {
            return true;
        }

        return $this->user()->player && $this->user()->player->id === $playerPhone->player_id;
    }

    public function rules(): array
    {
        return [
            'phone' => ['sometimes', 'string', 'max:50', Rule::unique('player_phones', 'phone')->ignore($this->route('playerPhone')), $this->pakistanPhoneRule()],
            'label' => ['sometimes', 'in:Primary,Secondary'],
            'is_whatsapp' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            $phone = $this->route('playerPhone');
            $label = $this->input('label', $phone->label);

            if ($this->has('label') && $label === 'Primary') {
                $existing = $phone->player->phones()
                    ->where('label', 'Primary')
                    ->where('id', '!=', $phone->id)
                    ->count();
                if ($existing >= 1) {
                    $validator->errors()->add('label', 'This player already has a primary number.');
                }
            }

            if ($this->has('label') && $label === 'Secondary') {
                $existing = $phone->player->phones()
                    ->where('label', 'Secondary')
                    ->where('id', '!=', $phone->id)
                    ->count();
                if ($existing >= 3) {
                    $validator->errors()->add('label', 'Maximum 3 secondary numbers allowed.');
                }
            }

            if ($this->boolean('is_whatsapp') && $label !== 'Primary') {
                $validator->errors()->add('is_whatsapp', 'Only the primary number can be marked as WhatsApp.');
            }
        });
    }

    private function pakistanPhoneRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            $clean = preg_replace('/[\s\-()]/', '', $value);

            if (! preg_match('/^(?:\+?92\d{9,10}|0\d{9,10})$/', $clean)) {
                $fail('Enter a valid Pakistani phone number (e.g. 0300 1234567).');
            }
        };
    }
}
