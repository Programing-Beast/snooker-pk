<?php

namespace Tests\Feature\Api;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Round;
use App\Models\Tournament;

class MatchTest extends ApiTestCase
{
    private Tournament $tournament;
    private Round $round1;
    private Round $round2;
    private Match_ $match;
    private Player $player2;

    protected function setUp(): void
    {
        parent::setUp();

        [$u2, $this->player2] = $this->createPlayerUser('Player 2');

        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $this->round1 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Semi Final', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);
        $this->round2 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 2, 'frames_to_win' => 5,
        ]);
        $this->match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round1->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $this->player2->id,
            'status' => 'scheduled',
        ]);
        // Create final match placeholder
        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round2->id,
            'position' => 1,
            'status' => 'scheduled',
        ]);
    }

    public function test_show_match_public(): void
    {
        $response = $this->getJson("/api/matches/{$this->match->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $this->match->id)
            ->assertJsonStructure(['data' => ['player1', 'player2', 'tournament', 'round']]);
    }

    public function test_show_match_not_found(): void
    {
        $response = $this->getJson('/api/matches/9999');

        $response->assertStatus(404);
    }

    public function test_update_match_admin(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/matches/{$this->match->id}", [
                'status' => 'live',
                'table_no' => '1',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'live')
            ->assertJsonPath('data.table_no', '1');
    }

    public function test_update_match_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/matches/{$this->match->id}", ['status' => 'live']);

        $response->assertStatus(403);
    }

    public function test_assign_umpire(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/assign-umpire", [
                'umpire_id' => $this->umpireUser->id,
            ]);

        $response->assertOk();
        $this->assertEquals($this->umpireUser->id, $this->match->fresh()->umpire_id);
    }

    public function test_assign_umpire_validates_user_exists(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/assign-umpire", [
                'umpire_id' => 9999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['umpire_id']);
    }

    public function test_walkover(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/walkover", [
                'winner_id' => $this->player->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'walkover')
            ->assertJsonPath('data.winner.id', $this->player->id);
    }

    public function test_walkover_invalid_winner(): void
    {
        [$u3, $p3] = $this->createPlayerUser('Outsider');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/walkover", [
                'winner_id' => $p3->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['winner_id']);
    }

    public function test_walkover_advances_winner(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/walkover", [
                'winner_id' => $this->player->id,
            ]);

        $finalMatch = Match_::where('round_id', $this->round2->id)->first();
        $this->assertEquals($this->player->id, $finalMatch->player1_id);
    }

    public function test_complete_match(): void
    {
        // Set match scores to meet frames_to_win (3)
        $this->match->update(['score1' => 3, 'score2' => 1, 'status' => 'live']);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/complete");

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.winner.id', $this->player->id);
    }

    public function test_complete_match_insufficient_frames(): void
    {
        $this->match->update(['score1' => 1, 'score2' => 1, 'status' => 'live']);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/complete");

        $response->assertStatus(422);
    }

    public function test_complete_match_advances_winner(): void
    {
        $this->match->update(['score1' => 3, 'score2' => 2, 'status' => 'live']);

        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/complete");

        $finalMatch = Match_::where('round_id', $this->round2->id)->first();
        $this->assertEquals($this->player->id, $finalMatch->player1_id);
    }

    public function test_update_match_scores(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/matches/{$this->match->id}", [
                'score1' => 2,
                'score2' => 3,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.score1', 2)
            ->assertJsonPath('data.score2', 3);
    }

    public function test_declare_winner(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/declare-winner", [
                'winner_id' => $this->player->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.winner.id', $this->player->id);
    }

    public function test_declare_winner_with_scores(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/declare-winner", [
                'winner_id' => $this->player2->id,
                'score1' => 1,
                'score2' => 3,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.winner.id', $this->player2->id)
            ->assertJsonPath('data.score1', 1)
            ->assertJsonPath('data.score2', 3);
    }

    public function test_declare_winner_invalid_player(): void
    {
        [$u3, $p3] = $this->createPlayerUser('Outsider');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/declare-winner", [
                'winner_id' => $p3->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['winner_id']);
    }

    public function test_declare_winner_advances_to_next_round(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/declare-winner", [
                'winner_id' => $this->player2->id,
            ]);

        $finalMatch = Match_::where('round_id', $this->round2->id)->first();
        $this->assertEquals($this->player2->id, $finalMatch->player1_id);
    }

    public function test_declare_winner_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson("/api/matches/{$this->match->id}/declare-winner", [
                'winner_id' => $this->player->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_board_umpire(): void
    {
        $response = $this->actingAs($this->umpireUser)
            ->getJson("/api/matches/{$this->match->id}/board");

        $response->assertOk()
            ->assertJsonStructure(['data' => ['player1', 'player2', 'round', 'frames']]);
    }

    public function test_board_admin(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/matches/{$this->match->id}/board");

        $response->assertOk();
    }

    public function test_board_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->getJson("/api/matches/{$this->match->id}/board");

        $response->assertStatus(403);
    }
}
