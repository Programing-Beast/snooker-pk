<?php

namespace Tests\Feature\Api;

use App\Models\Match_;
use App\Models\PlayerPhone;
use App\Models\Round;
use App\Models\Tournament;

class PlayerTest extends ApiTestCase
{
    public function test_list_players_public(): void
    {
        $response = $this->getJson('/api/players');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'country_code', 'tier', 'ranking_points']]]);
    }

    public function test_list_players_search(): void
    {
        $response = $this->getJson('/api/players?search=Test');

        $response->assertOk();
        $this->assertTrue(
            collect($response->json('data'))->every(fn ($p) => str_contains($p['name'], 'Test'))
        );
    }

    public function test_list_players_filter_tier(): void
    {
        [$user2, $player2] = $this->createPlayerUser('Amateur Guy');
        $player2->update(['tier' => 'amateur']);

        $response = $this->getJson('/api/players?tier=pro');

        $response->assertOk();
        $this->assertTrue(
            collect($response->json('data'))->every(fn ($p) => $p['tier'] === 'pro')
        );
    }

    public function test_list_players_validates_params(): void
    {
        $response = $this->getJson('/api/players?tier=invalid');

        $response->assertStatus(422);
    }

    public function test_show_player_public(): void
    {
        $response = $this->getJson("/api/players/{$this->player->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $this->player->id)
            ->assertJsonPath('data.name', 'Test Player');
    }

    public function test_show_player_hides_private_fields_for_guests(): void
    {
        $this->player->update(['address' => '123 Street']);
        $this->player->phones()->create(['phone' => '1234567890', 'label' => 'Primary']);

        $response = $this->getJson("/api/players/{$this->player->id}");

        $response->assertOk()
            ->assertJsonMissing(['phones'])
            ->assertJsonMissing(['address' => '123 Street']);
    }

    public function test_show_player_shows_private_fields_for_owner(): void
    {
        $this->player->update(['address' => '123 Street']);
        $this->player->phones()->create(['phone' => '1234567890', 'label' => 'Primary']);

        $response = $this->actingAs($this->playerUser)
            ->getJson("/api/players/{$this->player->id}");

        $response->assertOk()
            ->assertJsonPath('data.phones.0.phone', '1234567890')
            ->assertJsonPath('data.address', '123 Street');
    }

    public function test_show_player_shows_private_fields_for_admin(): void
    {
        $this->player->phones()->create(['phone' => '1234567890', 'label' => 'Primary']);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/players/{$this->player->id}");

        $response->assertOk()
            ->assertJsonPath('data.phones.0.phone', '1234567890');
    }

    public function test_store_player_admin_only(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/players', [
                'name' => 'Admin Created',
                'tier' => 'pro',
                'country_code' => 'PAK',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Admin Created');

        $this->assertDatabaseHas('players', ['name' => 'Admin Created']);
    }

    public function test_store_player_forbidden_for_non_admin(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/players', ['name' => 'Nope']);

        $response->assertStatus(403);
    }

    public function test_store_player_requires_auth(): void
    {
        $response = $this->postJson('/api/players', ['name' => 'Nope']);

        $response->assertStatus(401);
    }

    public function test_update_own_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/players/{$this->player->id}", [
                'name' => 'Updated Name',
                'city' => 'Lahore',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.city', 'Lahore');
    }

    public function test_update_player_cannot_edit_others(): void
    {
        [$otherUser, $otherPlayer] = $this->createPlayerUser('Other');

        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/players/{$otherPlayer->id}", ['name' => 'Hacked']);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_player(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/players/{$this->player->id}", [
                'tier' => 'amateur',
                'ranking_points' => 9999,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.tier', 'amateur')
            ->assertJsonPath('data.ranking_points', 9999);
    }

    public function test_player_cannot_update_admin_fields(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/players/{$this->player->id}", [
                'name' => 'OK',
                'tier' => 'amateur',
                'ranking_points' => 9999,
            ]);

        $response->assertOk();
        $this->player->refresh();
        $this->assertEquals('pro', $this->player->tier);
        $this->assertEquals(1000, $this->player->ranking_points);
    }

    public function test_update_player_requires_auth(): void
    {
        $response = $this->putJson("/api/players/{$this->player->id}", ['name' => 'X']);

        $response->assertStatus(401);
    }

    public function test_player_history(): void
    {
        $tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-01-01', 'end_date' => '2026-01-05',
        ]);
        $round = Round::create([
            'tournament_id' => $tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);
        [$u2, $p2] = $this->createPlayerUser('Opp');

        Match_::create([
            'tournament_id' => $tournament->id, 'round_id' => $round->id,
            'position' => 1, 'player1_id' => $this->player->id,
            'player2_id' => $p2->id, 'status' => 'completed',
            'winner_id' => $this->player->id,
        ]);

        $response = $this->actingAs($this->playerUser)
            ->getJson("/api/players/{$this->player->id}/history");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_player_upcoming(): void
    {
        $tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $round = Round::create([
            'tournament_id' => $tournament->id,
            'name' => 'R1', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);
        [$u2, $p2] = $this->createPlayerUser('Opp');

        Match_::create([
            'tournament_id' => $tournament->id, 'round_id' => $round->id,
            'position' => 1, 'player1_id' => $this->player->id,
            'player2_id' => $p2->id, 'status' => 'scheduled',
            'scheduled_at' => '2026-07-01 10:00:00',
        ]);

        $response = $this->actingAs($this->playerUser)
            ->getJson("/api/players/{$this->player->id}/upcoming");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
