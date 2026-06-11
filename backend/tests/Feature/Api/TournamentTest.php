<?php

namespace Tests\Feature\Api;

use App\Models\Player;
use App\Models\Prize;
use App\Models\Round;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\TournamentOrganizer;

class TournamentTest extends ApiTestCase
{
    private function makeTournament(array $overrides = []): Tournament
    {
        return Tournament::create(array_merge([
            'name' => 'National Championship',
            'slug' => 'national-championship-2026',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-05',
            'status' => 'upcoming',
            'entry_status' => 'open',
        ], $overrides));
    }

    public function test_list_tournaments_public(): void
    {
        $this->makeTournament();

        $response = $this->getJson('/api/tournaments');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'status']]]);
    }

    public function test_list_tournaments_filter_status(): void
    {
        $this->makeTournament(['slug' => 'a', 'status' => 'upcoming']);
        $this->makeTournament(['slug' => 'b', 'status' => 'live']);

        $response = $this->getJson('/api/tournaments?status=live');

        $response->assertOk();
        $this->assertTrue(
            collect($response->json('data'))->every(fn ($t) => $t['status'] === 'live')
        );
    }

    public function test_list_tournaments_search(): void
    {
        $this->makeTournament(['name' => 'Foobar Cup', 'slug' => 'foobar-cup']);

        $response = $this->getJson('/api/tournaments?search=Foobar');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_show_tournament_by_slug(): void
    {
        $t = $this->makeTournament();
        Prize::create(['tournament_id' => $t->id, 'position_label' => 'Winner', 'amount' => 50000]);
        TournamentOrganizer::create(['tournament_id' => $t->id, 'user_id' => $this->admin->id, 'role' => 'Director']);
        Round::create(['tournament_id' => $t->id, 'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 5]);

        $response = $this->getJson('/api/tournaments/national-championship-2026');

        $response->assertOk()
            ->assertJsonPath('data.slug', 'national-championship-2026')
            ->assertJsonStructure(['data' => ['prizes', 'organizers', 'rounds']]);
    }

    public function test_show_tournament_not_found(): void
    {
        $response = $this->getJson('/api/tournaments/nonexistent-slug');

        $response->assertStatus(404);
    }

    public function test_store_tournament_admin(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/tournaments', [
                'name' => 'New Tourney',
                'slug' => 'new-tourney',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-03',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Tourney');

        $this->assertDatabaseHas('tournaments', ['slug' => 'new-tourney']);
    }

    public function test_store_tournament_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/tournaments', [
                'name' => 'T', 'slug' => 't', 'start_date' => '2026-08-01', 'end_date' => '2026-08-03',
            ]);

        $response->assertStatus(403);
    }

    public function test_store_tournament_validates_required(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/tournaments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'slug', 'start_date', 'end_date']);
    }

    public function test_store_tournament_validates_unique_slug(): void
    {
        $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/tournaments', [
                'name' => 'Dup', 'slug' => 'national-championship-2026',
                'start_date' => '2026-08-01', 'end_date' => '2026-08-03',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_store_tournament_validates_end_date_after_start(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/tournaments', [
                'name' => 'T', 'slug' => 'bad-dates',
                'start_date' => '2026-08-05', 'end_date' => '2026-08-01',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_update_tournament_admin(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/tournaments/{$t->id}", [
                'name' => 'Updated Name',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.status', 'upcoming');
    }

    public function test_update_tournament_forbidden_for_player(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/tournaments/{$t->id}", ['name' => 'No']);

        $response->assertStatus(403);
    }

    public function test_delete_tournament_admin(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/tournaments/{$t->id}");

        $response->assertOk();
        $this->assertSoftDeleted('tournaments', ['id' => $t->id]);
    }

    public function test_delete_tournament_forbidden_for_player(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->playerUser)
            ->deleteJson("/api/tournaments/{$t->id}");

        $response->assertStatus(403);
    }

    public function test_tournament_draw(): void
    {
        $t = $this->makeTournament();
        $round = Round::create([
            'tournament_id' => $t->id, 'name' => 'R1', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);

        $response = $this->getJson("/api/tournaments/{$t->id}/draw");

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_tournament_players(): void
    {
        $t = $this->makeTournament();
        TournamentEntry::create([
            'tournament_id' => $t->id, 'player_id' => $this->player->id,
            'status' => 'approved', 'requested_at' => now(),
        ]);

        $response = $this->getJson("/api/tournaments/{$t->id}/players");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->player->id);
    }

    public function test_update_entry_status(): void
    {
        $t = $this->makeTournament(['entry_status' => 'open']);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/tournaments/{$t->id}/entry-status", [
                'entry_status' => 'closed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.entry_status', 'closed');
    }

    public function test_update_entry_status_validates(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/tournaments/{$t->id}/entry-status", [
                'entry_status' => 'invalid',
            ]);

        $response->assertStatus(422);
    }

    public function test_update_max_players(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/tournaments/{$t->id}/max-players", [
                'max_players' => 32,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.max_players', 32);
    }

    public function test_update_max_players_validates_min(): void
    {
        $t = $this->makeTournament();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/tournaments/{$t->id}/max-players", [
                'max_players' => 1,
            ]);

        $response->assertStatus(422);
    }
}
