<?php

namespace Tests\Feature\Api;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Round;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\User;

class QualifierTest extends ApiTestCase
{
    private Tournament $tournament;

    private Round $qualifier1;

    private Round $qualifier2;

    private Round $semiFinal;

    private Round $final;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tournament = Tournament::create([
            'name' => 'Qualifier Open', 'slug' => 'qualifier-open',
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(34)->toDateString(),
            'entry_status' => 'open',
            'max_players' => 4,
            'draw_size' => 4,
            'has_qualifiers' => true,
        ]);

        $this->qualifier1 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Qualifying Round 1', 'sort_order' => 1,
            'is_qualifier' => true, 'frames_to_win' => 3,
        ]);
        $this->qualifier2 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Qualifying Round 2', 'sort_order' => 2,
            'is_qualifier' => true, 'frames_to_win' => 3,
        ]);
        $this->semiFinal = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Semi Final', 'sort_order' => 3,
            'is_qualifier' => false, 'frames_to_win' => 4,
        ]);
        $this->final = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 4,
            'is_qualifier' => false, 'frames_to_win' => 5,
        ]);
    }

    private function makePlayer(string $name): Player
    {
        $user = User::factory()->create();
        $user->assignRole('player');

        return Player::create([
            'user_id' => $user->id,
            'name' => $name,
            'country_code' => 'PAK',
        ]);
    }

    /**
     * Create an approved entry. A null $roundId means a direct main-draw entry.
     */
    private function addEntry(Player $player, ?int $roundId = null, ?int $seed = null): TournamentEntry
    {
        return TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $player->id,
            'status' => 'approved',
            'source' => 'admin_added',
            'entry_round_id' => $roundId,
            'seed' => $seed,
            'requested_at' => now(),
        ]);
    }

    /**
     * Create players and assign them all to the given qualifier round.
     *
     * @return array<int, Player>
     */
    private function addQualifierPlayers(int $count, Round $round): array
    {
        $players = [];
        for ($i = 0; $i < $count; $i++) {
            $player = $this->makePlayer("Qualifier Player $i");
            $this->addEntry($player, $round->id);
            $players[] = $player;
        }

        return $players;
    }

    // ---------------------------------------------------------------- pool

    public function test_qualifier_pool_returns_players_assigned_to_round(): void
    {
        $players = $this->addQualifierPlayers(4, $this->qualifier1);

        // A direct main-draw entrant must not appear in the qualifier pool
        $this->addEntry($this->makePlayer('Direct Entrant'));

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier1->id}/pool");

        $response->assertOk()->assertJsonPath('count', 4);

        $returnedIds = collect($response->json('data'))->pluck('id')->sort()->values()->all();
        $expectedIds = collect($players)->pluck('id')->sort()->values()->all();
        $this->assertSame($expectedIds, $returnedIds);
    }

    public function test_qualifier_pool_excludes_already_paired_players(): void
    {
        $players = $this->addQualifierPlayers(4, $this->qualifier1);

        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier1->id}/pool");

        $response->assertOk()->assertJsonPath('count', 2);

        $returnedIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($players[0]->id, $returnedIds);
        $this->assertNotContains($players[1]->id, $returnedIds);
    }

    public function test_qualifier_pool_includes_winners_from_previous_qualifier_round(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'winner_id' => $players[0]->id,
            'status' => 'completed',
        ]);

        // Round 2 has its own direct entrant plus the round 1 survivor
        $secondRoundEntrant = $this->makePlayer('Round 2 Entrant');
        $this->addEntry($secondRoundEntrant, $this->qualifier2->id);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier2->id}/pool");

        $response->assertOk()->assertJsonPath('count', 2);

        $returnedIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($players[0]->id, $returnedIds);
        $this->assertContains($secondRoundEntrant->id, $returnedIds);
        $this->assertNotContains($players[1]->id, $returnedIds, 'The losing player must not advance.');
    }

    public function test_qualifier_pool_pulls_from_immediately_previous_qualifier_round(): void
    {
        // Three qualifier rounds: the pool for round 3 must come from round 2, not round 1.
        $this->semiFinal->update(['sort_order' => 4]);
        $this->final->update(['sort_order' => 5]);

        $qualifier3 = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Qualifying Round 3', 'sort_order' => 3,
            'is_qualifier' => true, 'frames_to_win' => 3,
        ]);

        $roundOne = $this->addQualifierPlayers(2, $this->qualifier1);
        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $roundOne[0]->id,
            'player2_id' => $roundOne[1]->id,
            'winner_id' => $roundOne[0]->id,
            'status' => 'completed',
        ]);

        $roundTwo = $this->addQualifierPlayers(2, $this->qualifier2);
        Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier2->id,
            'position' => 1,
            'player1_id' => $roundTwo[0]->id,
            'player2_id' => $roundTwo[1]->id,
            'winner_id' => $roundTwo[0]->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$qualifier3->id}/pool");

        $response->assertOk();

        $returnedIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($roundTwo[0]->id, $returnedIds, 'Pool must hold the round 2 winner.');
        $this->assertNotContains($roundOne[0]->id, $returnedIds, 'Pool must not reach back to round 1.');
    }

    public function test_qualifier_pool_requires_admin(): void
    {
        $this->actingAs($this->playerUser)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier1->id}/pool")
            ->assertStatus(403);
    }

    // -------------------------------------------------------- manual pairing

    public function test_create_qualifier_match_pairs_two_pool_players(): void
    {
        $players = $this->addQualifierPlayers(4, $this->qualifier1);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
                'player1_id' => $players[0]->id,
                'player2_id' => $players[1]->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('matches', [
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_create_qualifier_match_increments_position(): void
    {
        $players = $this->addQualifierPlayers(4, $this->qualifier1);

        foreach ([[0, 1], [2, 3]] as $pair) {
            $this->actingAs($this->admin)
                ->postJson('/api/matches/qualifier', [
                    'tournament_id' => $this->tournament->id,
                    'round_id' => $this->qualifier1->id,
                    'player1_id' => $players[$pair[0]]->id,
                    'player2_id' => $players[$pair[1]]->id,
                ])->assertStatus(201);
        }

        $positions = Match_::where('round_id', $this->qualifier1->id)
            ->orderBy('position')->pluck('position')->all();

        $this->assertSame([1, 2], $positions);
    }

    public function test_create_qualifier_match_rejects_non_qualifier_round(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->semiFinal->id,
                'player1_id' => $players[0]->id,
                'player2_id' => $players[1]->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['round']);
    }

    public function test_create_qualifier_match_rejects_players_outside_pool(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);
        $outsider = $this->makePlayer('Not Entered');

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
                'player1_id' => $players[0]->id,
                'player2_id' => $outsider->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['players']);
    }

    public function test_create_qualifier_match_rejects_same_player_twice(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
                'player1_id' => $players[0]->id,
                'player2_id' => $players[0]->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['player2_id']);
    }

    public function test_create_qualifier_match_requires_admin(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $this->actingAs($this->playerUser)
            ->postJson('/api/matches/qualifier', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
                'player1_id' => $players[0]->id,
                'player2_id' => $players[1]->id,
            ])
            ->assertStatus(403);
    }

    // --------------------------------------------------------- auto generate

    public function test_generate_qualifier_draw_pairs_all_pool_players(): void
    {
        $this->addQualifierPlayers(6, $this->qualifier1);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
            ]);

        $response->assertStatus(201)->assertJsonPath('matches_created', 3);

        $this->assertSame(3, Match_::where('round_id', $this->qualifier1->id)->count());
    }

    public function test_generate_qualifier_draw_leaves_odd_player_unpaired(): void
    {
        $this->addQualifierPlayers(5, $this->qualifier1);

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
            ])
            ->assertStatus(201)
            ->assertJsonPath('matches_created', 2);

        // The unpaired player stays available in the pool
        $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier1->id}/pool")
            ->assertOk()
            ->assertJsonPath('count', 1);
    }

    public function test_generate_qualifier_draw_requires_two_available_players(): void
    {
        $this->addQualifierPlayers(1, $this->qualifier1);

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier1->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['pool']);
    }

    public function test_generate_qualifier_draw_rejects_non_qualifier_round(): void
    {
        $this->addQualifierPlayers(4, $this->qualifier1);

        $this->actingAs($this->admin)
            ->postJson('/api/matches/qualifier/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->semiFinal->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['round']);
    }

    // ---------------------------------------------------------------- delete

    public function test_delete_qualifier_match(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/matches/{$match->id}/qualifier")
            ->assertOk();

        // deleteQualifierMatch force-deletes, so the row is gone entirely
        $this->assertDatabaseMissing('matches', ['id' => $match->id]);

        // Both players return to the pool
        $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/rounds/{$this->qualifier1->id}/pool")
            ->assertOk()
            ->assertJsonPath('count', 2);
    }

    public function test_delete_qualifier_match_rejects_played_match(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'winner_id' => $players[0]->id,
            'status' => 'completed',
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/matches/{$match->id}/qualifier")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['match']);

        $this->assertDatabaseHas('matches', ['id' => $match->id]);
    }

    public function test_delete_qualifier_match_rejects_non_qualifier_match(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->semiFinal->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/matches/{$match->id}/qualifier")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['match']);
    }

    // ------------------------------------------------------- entries/capacity

    public function test_qualifier_entries_do_not_count_toward_max_players(): void
    {
        // Fill the main draw to capacity (max_players = 4)
        for ($i = 0; $i < 4; $i++) {
            $this->addEntry($this->makePlayer("Main Draw $i"));
        }

        $qualifierPlayer = $this->makePlayer('Qualifier Hopeful');

        $this->actingAs($this->admin)
            ->postJson('/api/entries/admin-add', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $qualifierPlayer->id,
                'entry_round_id' => $this->qualifier1->id,
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('tournament_entries', [
            'tournament_id' => $this->tournament->id,
            'player_id' => $qualifierPlayer->id,
            'entry_round_id' => $this->qualifier1->id,
            'status' => 'approved',
        ]);
    }

    public function test_main_draw_entries_still_enforce_max_players(): void
    {
        for ($i = 0; $i < 4; $i++) {
            $this->addEntry($this->makePlayer("Main Draw $i"));
        }

        $this->actingAs($this->admin)
            ->postJson('/api/entries/admin-add', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $this->makePlayer('One Too Many')->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['tournament']);
    }

    public function test_bulk_admin_add_skips_capacity_for_qualifier_round(): void
    {
        for ($i = 0; $i < 4; $i++) {
            $this->addEntry($this->makePlayer("Main Draw $i"));
        }

        $ids = collect(range(1, 3))
            ->map(fn ($i) => $this->makePlayer("Bulk Qualifier $i")->id)
            ->all();

        $this->actingAs($this->admin)
            ->postJson('/api/entries/admin-add', [
                'tournament_id' => $this->tournament->id,
                'player_ids' => $ids,
                'entry_round_id' => $this->qualifier1->id,
            ])
            ->assertStatus(201)
            ->assertJsonPath('added', 3);
    }

    public function test_set_entry_round_moves_player_into_qualifier_round(): void
    {
        $player = $this->makePlayer('Reassigned');
        $entry = $this->addEntry($player);

        $this->actingAs($this->admin)
            ->putJson("/api/entries/{$entry->id}/entry-round", [
                'entry_round_id' => $this->qualifier1->id,
            ])
            ->assertOk();

        $this->assertDatabaseHas('tournament_entries', [
            'id' => $entry->id,
            'entry_round_id' => $this->qualifier1->id,
        ]);
    }

    public function test_entries_accept_qualifier_transfer_source(): void
    {
        // Guards the enum value added by the qualifier_transfer migration --
        // a raw MySQL ALTER here previously made the whole suite unrunnable.
        $player = $this->makePlayer('Transferred');

        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $player->id,
            'status' => 'approved',
            'source' => 'qualifier_transfer',
            'requested_at' => now(),
        ]);

        $this->assertDatabaseHas('tournament_entries', [
            'id' => $entry->id,
            'source' => 'qualifier_transfer',
        ]);
    }

    // ------------------------------------------------------------ advancement

    public function test_completing_qualifier_match_does_not_advance_into_bracket(): void
    {
        $players = $this->addQualifierPlayers(2, $this->qualifier1);

        $match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier1->id,
            'position' => 1,
            'player1_id' => $players[0]->id,
            'player2_id' => $players[1]->id,
            'score1' => 3, 'score2' => 0,
            'status' => 'live',
        ]);

        // A placeholder in the next round that must stay empty
        $nextMatch = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->qualifier2->id,
            'position' => 1,
            'status' => 'scheduled',
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/matches/{$match->id}/complete")
            ->assertOk();

        $this->assertSame($players[0]->id, $match->fresh()->winner_id);

        $nextMatch->refresh();
        $this->assertNull($nextMatch->player1_id);
        $this->assertNull($nextMatch->player2_id);
    }

    public function test_main_draw_includes_qualifier_survivors_and_direct_entrants(): void
    {
        // Two players go straight into the main draw
        $direct1 = $this->makePlayer('Direct One');
        $direct2 = $this->makePlayer('Direct Two');
        $this->addEntry($direct1);
        $this->addEntry($direct2);

        // Four fight through the final qualifier round; two survive
        $qualifiers = $this->addQualifierPlayers(4, $this->qualifier2);

        foreach ([[0, 1], [2, 3]] as $i => $pair) {
            Match_::create([
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->qualifier2->id,
                'position' => $i + 1,
                'player1_id' => $qualifiers[$pair[0]]->id,
                'player2_id' => $qualifiers[$pair[1]]->id,
                'winner_id' => $qualifiers[$pair[0]]->id,
                'status' => 'completed',
            ]);
        }

        $this->actingAs($this->admin)
            ->postJson('/api/draw/generate', [
                'tournament_id' => $this->tournament->id,
                'round_id' => $this->semiFinal->id,
            ])
            ->assertOk();

        $placed = Match_::where('round_id', $this->semiFinal->id)
            ->get()
            ->flatMap(fn ($m) => array_filter([$m->player1_id, $m->player2_id]))
            ->unique()
            ->values()
            ->all();

        sort($placed);
        $expected = [$direct1->id, $direct2->id, $qualifiers[0]->id, $qualifiers[2]->id];
        sort($expected);

        $this->assertSame($expected, $placed, 'Main draw must hold both direct entrants and both qualifier survivors.');
        $this->assertNotContains($qualifiers[1]->id, $placed, 'Eliminated qualifiers must not reach the main draw.');
        $this->assertNotContains($qualifiers[3]->id, $placed, 'Eliminated qualifiers must not reach the main draw.');
    }
}
