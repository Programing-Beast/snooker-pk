<?php

namespace App\Services;

use App\Models\Player;
use App\Models\PlayerPhone;
use Illuminate\Database\Eloquent\Collection;

class PlayerPhoneService
{
    public function list(Player $player): Collection
    {
        return $player->phones;
    }

    public function store(Player $player, array $data): PlayerPhone
    {
        return $player->phones()->create($data);
    }

    public function update(PlayerPhone $phone, array $data): PlayerPhone
    {
        $phone->update($data);

        return $phone->fresh();
    }

    public function delete(PlayerPhone $phone): void
    {
        $phone->delete();
    }
}
