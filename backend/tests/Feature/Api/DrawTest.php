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

    private Round $firstRound;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
            'entry_status' => 'closed', 'max_players' => 8,
        ]);
        $this->firstRound = Round::create([
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

    private function seedPlayers(int $count, int $seededCount = 0): array
    {
        $players = [];
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

            $players[] = $player;
        }

        return $players;
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
                'round_id' => $this->firstRound->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw generated successfully.');

        // 4 players => draw_size 4 => 2 first-round matches + 1 semi = 3
        $this->assertEquals(3, $this->tournament->matches()->count());
    }

    public function test_generate_draw_with_byes(): void
    {
        $this->seedPlayers(3);
        $this->tournament->update(['draw_size' => 4]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
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
                'round_id' => $this->firstRound->id,
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
                'round_id' => $this->firstRound->id,
            ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/confirm', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw confirmed.');

        $this->assertNotNull($this->firstRound->fresh()->generated_at);
    }

    public function test_reroll_draw(): void
    {
        $this->seedPlayers(4);
        $this->tournament->update(['draw_size' => 4]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
            ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/reroll', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw re-rolled successfully.');
    }

    public function test_generate_draw_without_round_id_auto_creates_rounds(): void
    {
        // Remove manually-created rounds so auto-creation kicks in
        Round::where('tournament_id', $this->tournament->id)->forceDelete();
        $this->seedPlayers(4);
        $this->tournament->update(['draw_size' => 4]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertOk();

        // Should auto-create 2 rounds for 4 players: Semi Final, Final
        $rounds = $this->tournament->rounds()->orderBy('sort_order')->get();
        $this->assertEquals(2, $rounds->count());
        $this->assertEquals('Semi Final', $rounds[0]->name);
        $this->assertEquals('Final', $rounds[1]->name);

        // 2 first-round matches + 1 final placeholder = 3
        $this->assertEquals(3, $this->tournament->matches()->count());
    }

    public function test_auto_round_names_for_larger_draws(): void
    {
        Round::where('tournament_id', $this->tournament->id)->forceDelete();
        $this->seedPlayers(8);
        $this->tournament->update(['draw_size' => 8]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
            ]);

        $rounds = $this->tournament->rounds()->orderBy('sort_order')->get();
        $this->assertEquals(3, $rounds->count());
        $this->assertEquals('Quarter Final', $rounds[0]->name);
        $this->assertEquals('Semi Final', $rounds[1]->name);
        $this->assertEquals('Final', $rounds[2]->name);
    }

    public function test_bye_winners_advance_to_next_round(): void
    {
        // 3 players in a 4-draw = 1 bye, bye winner should advance
        $this->seedPlayers(3);
        $this->tournament->update(['draw_size' => 4]);

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
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

    public function test_generate_draw_with_explicit_pairings(): void
    {
        $players = $this->seedPlayers(4);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->firstRound->id,
                'pairings' => [
                    ['player1_id' => $players[0]->id, 'player2_id' => $players[3]->id],
                    ['player1_id' => $players[1]->id, 'player2_id' => $players[2]->id],
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Draw generated successfully.');

        // Verify the pairings were saved in the order specified
        $matches = $this->firstRound->matches()->orderBy('position')->get();
        $this->assertEquals(2, $matches->count());
        $this->assertEquals($players[0]->id, $matches[0]->player1_id);
        $this->assertEquals($players[3]->id, $matches[0]->player2_id);
        $this->assertEquals($players[1]->id, $matches[1]->player1_id);
        $this->assertEquals($players[2]->id, $matches[1]->player2_id);
    }
}
