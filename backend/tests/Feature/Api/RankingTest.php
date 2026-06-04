<?php

namespace Tests\Feature\Api;

class RankingTest extends ApiTestCase
{
    public function test_list_rankings_public(): void
    {
        $response = $this->getJson('/api/rankings');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'ranking_points']]]);
    }

    public function test_list_rankings_ordered_by_points_desc(): void
    {
        [$u2, $p2] = $this->createPlayerUser('High Rank');
        $p2->update(['ranking_points' => 5000]);

        $response = $this->getJson('/api/rankings');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual($data[1]['ranking_points'], $data[0]['ranking_points']);
    }

    public function test_list_rankings_filter_tier(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Amateur');
        $p2->update(['tier' => 'amateur']);

        $response = $this->getJson('/api/rankings?tier=pro');

        $response->assertOk();
        $this->assertTrue(
            collect($response->json('data'))->every(fn ($p) => $p['tier'] === 'pro')
        );
    }

    public function test_list_rankings_excludes_inactive(): void
    {
        $this->player->update(['status' => 'inactive']);

        $response = $this->getJson('/api/rankings');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertNotContains($this->player->id, $ids);
    }

    public function test_adjust_ranking_admin(): void
    {
        $originalPoints = $this->player->ranking_points;

        $response = $this->actingAs($this->admin)
            ->postJson('/api/rankings/adjust', [
                'player_id' => $this->player->id,
                'points' => 200,
                'reason' => 'Tournament win bonus',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.ranking_points', $originalPoints + 200);

        $this->player->refresh();
        $this->assertEquals($originalPoints + 200, $this->player->ranking_points);
    }

    public function test_adjust_ranking_negative(): void
    {
        $originalPoints = $this->player->ranking_points;

        $response = $this->actingAs($this->admin)
            ->postJson('/api/rankings/adjust', [
                'player_id' => $this->player->id,
                'points' => -100,
                'reason' => 'Penalty deduction',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.ranking_points', $originalPoints - 100);
    }

    public function test_adjust_ranking_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/rankings/adjust', [
                'player_id' => $this->player->id,
                'points' => 100,
                'reason' => 'Nope',
            ]);

        $response->assertStatus(403);
    }

    public function test_adjust_ranking_requires_auth(): void
    {
        $response = $this->postJson('/api/rankings/adjust', [
            'player_id' => $this->player->id,
            'points' => 100,
            'reason' => 'Nope',
        ]);

        $response->assertStatus(401);
    }

    public function test_adjust_ranking_validates_required(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/rankings/adjust', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['player_id', 'points', 'reason']);
    }

    public function test_adjust_ranking_validates_player_exists(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/rankings/adjust', [
                'player_id' => 9999,
                'points' => 100,
                'reason' => 'Test',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['player_id']);
    }
}
