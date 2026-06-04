<?php

namespace Tests\Feature\Api;

use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $umpireUser;
    protected User $playerUser;
    protected Player $player;

    protected function setUp(): void
    {
        parent::setUp();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'player']);
        Role::create(['name' => 'umpire']);

        $this->admin = User::factory()->create(['name' => 'Admin', 'email' => 'admin@test.com']);
        $this->admin->assignRole('admin');

        $this->umpireUser = User::factory()->create(['name' => 'Umpire', 'email' => 'umpire@test.com']);
        $this->umpireUser->assignRole('umpire');

        $this->playerUser = User::factory()->create(['name' => 'Test Player', 'email' => 'player@test.com']);
        $this->playerUser->assignRole('player');
        $this->player = Player::create([
            'user_id' => $this->playerUser->id,
            'name' => 'Test Player',
            'country_code' => 'PAK',
            'tier' => 'pro',
            'ranking_points' => 1000,
        ]);
    }

    protected function createPlayerUser(string $name = 'Another Player'): array
    {
        $user = User::factory()->create(['name' => $name]);
        $user->assignRole('player');
        $player = Player::create([
            'user_id' => $user->id,
            'name' => $name,
            'country_code' => 'PAK',
            'tier' => 'amateur',
            'ranking_points' => 500,
        ]);

        return [$user, $player];
    }
}
