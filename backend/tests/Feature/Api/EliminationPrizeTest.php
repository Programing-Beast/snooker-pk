<?php

namespace Tests\Feature\Api;

use App\Models\Match_;
use App\Models\Round;
use App\Models\Tournament;

class EliminationPrizeTest extends ApiTestCase
{
    private Tournament $tournament;
    private Round $round1;
    private Round $round2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $this->round1 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Semi Final', 'sort_order' => 1, 'frames_to_win' => 3,
            'elimination_prize' => 5000,
        ]);
        $this->round2 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 2, 'frames_to_win' => 5,
            'elimination_prize' => 10000,
        ]);
    }

    public function test_elimination_prize_on_match_completion(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Player 2');

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round1->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $p2->id,
            'score1' => 3,
            'score2' => 1,
            'status' => 'live',
        ]);

        // Create final match slot for advancement
        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round2->id,
            'position' => 1,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$match->id}/complete");

        // Loser (p2) should receive elimination prize
        $this->assertDatabaseHas('prize_awards', [
            'tournament_id' => $this->tournament->id,
            'player_id' => $p2->id,
            'round_id' => $this->round1->id,
            'category' => 'round_elimination',
            'amount' => '5000.00',
            'status' => 'awarded',
        ]);
    }

    public function test_no_elimination_prize_when_not_set(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Player 2');

        $roundNoPrize = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Quarter Final', 'sort_order' => 0, 'frames_to_win' => 3,
            'elimination_prize' => null,
        ]);

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $roundNoPrize->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $p2->id,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$match->id}/walkover", [
                'winner_id' => $this->player->id,
            ]);

        $this->assertDatabaseMissing('prize_awards', [
            'player_id' => $p2->id,
            'category' => 'round_elimination',
        ]);
    }

    public function test_elimination_prize_on_walkover(): void
    {
        [$u2, $p2] = $this->createPlayerUser('Player 2');

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round1->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $p2->id,
            'status' => 'scheduled',
        ]);

        // Create final match slot
        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round2->id,
            'position' => 1,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$match->id}/walkover", [
                'winner_id' => $this->player->id,
            ]);

        $this->assertDatabaseHas('prize_awards', [
            'player_id' => $p2->id,
            'category' => 'round_elimination',
            'amount' => '5000.00',
        ]);
    }

    public function test_store_round_with_elimination_prize(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/tournaments/{$this->tournament->id}/rounds", [
                'name' => 'Quarter Final',
                'sort_order' => 0,
                'frames_to_win' => 3,
                'elimination_prize' => 3000,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.elimination_prize', '3000.00');
    }

    public function test_update_round_elimination_prize(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/rounds/{$this->round1->id}", [
                'elimination_prize' => 7500,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.elimination_prize', '7500.00');
    }
}
