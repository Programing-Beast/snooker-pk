<?php

namespace Tests\Feature\Api;

use App\Models\Prize;
use App\Models\Tournament;

class PrizeTest extends ApiTestCase
{
    private Tournament $tournament;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
    }

    public function test_list_prizes(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Winner', 'amount' => 50000, 'sort_order' => 0,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/prizes");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.position_label', 'Winner');
    }

    public function test_store_prize(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/prizes", [
                'position_label' => 'Runner-up',
                'amount' => 25000,
                'sort_order' => 1,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.position_label', 'Runner-up')
            ->assertJsonPath('data.amount', '25000.00');

        $this->assertDatabaseHas('prizes', ['position_label' => 'Runner-up']);
    }

    public function test_store_prize_validates_required(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/prizes", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['position_label', 'amount']);
    }

    public function test_store_prize_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson("/api/tournaments/{$this->tournament->id}/prizes", [
                'position_label' => 'X', 'amount' => 100,
            ]);

        $response->assertStatus(403);
    }

    public function test_show_prize(): void
    {
        $prize = Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Winner', 'amount' => 50000,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/prizes/{$prize->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $prize->id);
    }

    public function test_update_prize(): void
    {
        $prize = Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Winner', 'amount' => 50000,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/prizes/{$prize->id}", [
                'amount' => 75000,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.amount', '75000.00');
    }

    public function test_delete_prize(): void
    {
        $prize = Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Winner', 'amount' => 50000,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/prizes/{$prize->id}");

        $response->assertOk();
        $this->assertSoftDeleted('prizes', ['id' => $prize->id]);
    }
}
