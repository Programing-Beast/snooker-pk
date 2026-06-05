<?php

namespace Tests\Feature\Api;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Prize;
use App\Models\PrizeAward;
use App\Models\Round;
use App\Models\Tournament;

class PrizeAwardTest extends ApiTestCase
{
    private Tournament $tournament;
    private Prize $prize;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $this->prize = Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Participation', 'amount' => 1000,
            'type' => 'custom', 'sort_order' => 5,
        ]);
    }

    public function test_store_prize_award(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/prize-awards', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $this->player->id,
                'prize_id' => $this->prize->id,
                'amount' => 1000,
                'is_ranking' => true,
                'category' => 'custom',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount', '1000.00')
            ->assertJsonPath('data.category', 'custom')
            ->assertJsonPath('data.status', 'awarded');

        $this->assertDatabaseHas('prize_awards', [
            'player_id' => $this->player->id,
            'amount' => '1000.00',
        ]);
    }

    public function test_store_prize_award_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/prize-awards', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $this->player->id,
                'amount' => 1000,
                'category' => 'custom',
            ]);

        $response->assertStatus(403);
    }

    public function test_bulk_award(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Player 2');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/prize-awards/bulk', [
                'tournament_id' => $this->tournament->id,
                'prize_id' => $this->prize->id,
                'player_ids' => [$this->player->id, $p2->id],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('prize_awards', [
            'player_id' => $this->player->id,
            'prize_id' => $this->prize->id,
        ]);
        $this->assertDatabaseHas('prize_awards', [
            'player_id' => $p2->id,
            'prize_id' => $this->prize->id,
        ]);
    }

    public function test_confirm_pending_award(): void
    {
        $award = PrizeAward::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'prize_id' => $this->prize->id,
            'amount' => 5000,
            'is_ranking' => true,
            'category' => 'score_prize',
            'status' => PrizeAward::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/prize-awards/{$award->id}", [
                'status' => 'awarded',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'awarded');

        $this->assertDatabaseHas('prize_awards', [
            'id' => $award->id,
            'status' => 'awarded',
        ]);
    }

    public function test_list_tournament_awards(): void
    {
        PrizeAward::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'amount' => 1000,
            'is_ranking' => true,
            'category' => 'custom',
            'status' => 'awarded',
            'awarded_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/prize-awards");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_player_history(): void
    {
        PrizeAward::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'amount' => 2000,
            'is_ranking' => true,
            'category' => 'manual_adjustment',
            'status' => 'awarded',
            'reason' => 'Test adjustment',
            'awarded_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/players/{$this->player->id}/prize-history");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'manual_adjustment');
    }

    public function test_eligible_players(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Player 2');

        $round = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Round 1', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);

        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $round->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $p2->id,
            'status' => 'completed',
            'winner_id' => $this->player->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/eligible-players");

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($this->player->id, $ids);
        $this->assertContains($p2->id, $ids);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/prize-awards', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tournament_id', 'player_id', 'amount', 'category']);
    }

    public function test_bulk_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/prize-awards/bulk', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tournament_id', 'prize_id', 'player_ids']);
    }
}
