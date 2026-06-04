<?php

namespace Tests\Feature\Api;

use App\Models\Player;
use App\Models\Round;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\User;

class DrawTest extends ApiTestCase
{
    private Tournament $tournament;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
            'entry_status' => 'closed', 'max_players' => 8,
        ]);
        Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Quarter Final', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);
        Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Semi Final', 'sort_order' => 2, 'frames_to_win' => 4,
        ]);
        Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 3, 'frames_to_win' => 5,
        ]);
    }

    private function seedPlayers(int $count, int $seededCount = 0): void
    {
        for ($i = 0; $i < $count; $i++) {
            $user = User::factory()->create();
            $user->assignRole('player');
            $player = Player::create([
                'user_id' => $user->id,
                'name' => "Draw Player $i",
                'country_code' => 'PAK',
            ]);

            TournamentEntry::create([
                'tournament_id' => $this->tournament->id,
                'player_id' => $player->id,
                'status' => 'approved',
                'seed' => $i < $seededCount ? $i + 1 : null,
                'requested_at' => now(),
            ]);
        }
    }

    public function test_preview_draw(): void
    {
        $this->seedPlayers(6, 2);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/draw/{$this->tournament->id}/preview");

        $response->assertOk()
            ->assertJsonPath('data.player_count', 6)
            ->assertJsonPath('data.draw_size', 8)
            ->assertJsonPath('data.bye_count', 2);
    }

    public function test_preview_draw_requires_minimum_players(): void
    {
        $this->seedPlayers(1);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/draw/{$this->tournament->id}/preview");

        $response->assertStatus(422);
    }

    public function test_generate_draw(): void
    {
        $this->seedPlayers(4, 2);
        $this->tournament->update(['draw_size' => 4]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw generated successfully.');

        // 4 players => draw_size 4 => 2 first-round matches + 1 final = 3
        $this->assertEquals(3, $this->tournament->matches()->count());
    }

    public function test_generate_draw_with_byes(): void
    {
        $this->seedPlayers(3);
        $this->tournament->update(['draw_size' => 4]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertOk();

        // Should have bye match(es)
        $byeMatches = $this->tournament->matches()->where('status', 'bye')->count();
        $this->assertEquals(1, $byeMatches);
    }

    public function test_generate_draw_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_generate_draw_validates_tournament_id(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tournament_id']);
    }

    public function test_confirm_draw(): void
    {
        $this->seedPlayers(4);
        $this->tournament->update(['draw_size' => 4]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/confirm', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw confirmed.');

        $firstRound = $this->tournament->rounds()->orderBy('sort_order')->first();
        $this->assertNotNull($firstRound->fresh()->generated_at);
    }

    public function test_reroll_draw(): void
    {
        $this->seedPlayers(4);
        $this->tournament->update(['draw_size' => 4]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/reroll', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw re-rolled successfully.');
    }

    public function test_generate_draw_no_rounds_fails(): void
    {
        $noRoundTourney = Tournament::create([
            'name' => 'T2', 'slug' => 't2',
            'start_date' => '2026-08-01', 'end_date' => '2026-08-05',
            'draw_size' => 4,
        ]);

        // Add players to the no-round tournament
        for ($i = 0; $i < 4; $i++) {
            $user = User::factory()->create();
            $user->assignRole('player');
            $player = Player::create([
                'user_id' => $user->id, 'name' => "NR $i", 'country_code' => 'PAK',
            ]);
            TournamentEntry::create([
                'tournament_id' => $noRoundTourney->id,
                'player_id' => $player->id,
                'status' => 'approved', 'requested_at' => now(),
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $noRoundTourney->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_bye_winners_advance_to_next_round(): void
    {
        // 3 players in a 4-draw = 1 bye, bye winner should advance
        $this->seedPlayers(3);
        $this->tournament->update(['draw_size' => 4]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $rounds = $this->tournament->rounds()->orderBy('sort_order')->get();
        $secondRound = $rounds[1];

        // The bye winner should appear in the second round
        $secondRoundMatches = $secondRound->matches;
        $hasAdvancedPlayer = $secondRoundMatches->contains(
            fn ($m) => $m->player1_id !== null || $m->player2_id !== null
        );

        $this->assertTrue($hasAdvancedPlayer);
    }
}
