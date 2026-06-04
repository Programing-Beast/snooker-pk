<?php

namespace Tests\Feature\Api;

use App\Models\Round;
use App\Models\Tournament;

class RoundTest extends ApiTestCase
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

    public function test_list_rounds(): void
    {
        Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Quarter Final', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Quarter Final');
    }

    public function test_store_round(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/rounds", [
                'name' => 'Semi Final',
                'sort_order' => 2,
                'frames_to_win' => 4,
                'draw_mode' => 'fixed',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Semi Final')
            ->assertJsonPath('data.frames_to_win', 4);

        $this->assertDatabaseHas('rounds', ['name' => 'Semi Final']);
    }

    public function test_store_round_validates_required(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/rounds", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'sort_order', 'frames_to_win']);
    }

    public function test_store_round_validates_draw_mode(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/rounds", [
                'name' => 'R', 'sort_order' => 1, 'frames_to_win' => 3,
                'draw_mode' => 'invalid',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['draw_mode']);
    }

    public function test_store_round_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson("/api/tournaments/{$this->tournament->id}/rounds", [
                'name' => 'R', 'sort_order' => 1, 'frames_to_win' => 3,
            ]);

        $response->assertStatus(403);
    }

    public function test_show_round(): void
    {
        $round = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/rounds/{$round->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $round->id);
    }

    public function test_update_round(): void
    {
        $round = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/rounds/{$round->id}", [
                'frames_to_win' => 6,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.frames_to_win', 6);
    }

    public function test_delete_round(): void
    {
        $round = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/rounds/{$round->id}");

        $response->assertOk();
        $this->assertSoftDeleted('rounds', ['id' => $round->id]);
    }
}
