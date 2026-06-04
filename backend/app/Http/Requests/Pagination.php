<?php

namespace App\Http\Requests;

final class Pagination
{
    public const MAX_PER_PAGE = 200;
    public const DEFAULT_PER_PAGE = 25;

    public static function rules(): array
    {
        return ['sometimes', 'integer', 'min:1', 'max:' . self::MAX_PER_PAGE];
    }
}
