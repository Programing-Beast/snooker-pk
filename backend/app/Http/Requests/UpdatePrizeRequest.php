<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'position_label' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'count' => ['sometimes', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_highlight' => ['sometimes', 'boolean'],
            'type' => ['sometimes', 'string', 'in:winner,runner_up,custom'],
            'ranking_prize' => ['sometimes', 'boolean'],
            'multiple' => ['sometimes', 'boolean'],
            'score_threshold' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $prize = $this->route('prize');

            if ($prize && $prize->isSystemPrize() && $this->has('type') && $this->type !== $prize->type) {
                $validator->errors()->add('type', 'Cannot change the type of a system prize.');
            }
        });
    }
}
