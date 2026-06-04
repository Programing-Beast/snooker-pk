<?php

namespace App\Http\Requests;

use App\Models\PlayerPhone;
use Illuminate\Foundation\Http\FormRequest;

class StorePlayerPhoneRequest extends FormRequest
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
        return [
            'phone' => ['required', 'string', 'max:50', 'unique:player_phones,phone', $this->pakistanPhoneRule()],
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

            $player = $this->route('player');
            $label = $this->input('label', 'Primary');

            if ($label === 'Primary') {
                $existing = $player->phones()->where('label', 'Primary')->count();
                if ($existing >= 1) {
                    $validator->errors()->add('label', 'This player already has a primary number.');
                }
            }

            if ($label === 'Secondary') {
                $existing = $player->phones()->where('label', 'Secondary')->count();
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
