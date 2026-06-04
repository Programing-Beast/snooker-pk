<?php

namespace App\Events;

use App\Models\Match_;

class MatchCompleted
{
    public function __construct(public readonly Match_ $match) {}
}
