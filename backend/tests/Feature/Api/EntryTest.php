<?php

namespace Tests\Feature\Api;

use App\Models\Tournament;
use App\Models\TournamentEntry;

class EntryTest extends ApiTestCase
{
    private Tournament $tournament;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
            'entry_status' => 'open', 'max_players' => 32,
        ]);
    }

    public function test_request_entry(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/entries/request', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.source', 'self_request');

        $this->assertDatabaseHas('tournament_entries', [
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
        ]);
    }

    public function test_request_entry_requires_auth(): void
    {
        $response = $this->postJson('/api/entries/request', [
            'tournament_id' => $this->tournament->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_request_entry_requires_player_profile(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/entries/request', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_request_entry_duplicate_rejected(): void
    {
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/entries/request', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['player']);
    }

    public function test_request_entry_closed_tournament(): void
    {
        $this->tournament->update(['entry_status' => 'closed']);

        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/entries/request', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tournament']);
    }

    public function test_request_entry_capacity_full(): void
    {
        $this->tournament->update(['max_players' => 1]);

        [$u2, $p2] = $this->createPlayerUser('P2');
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $p2->id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/entries/request', [
                'tournament_id' => $this->tournament->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tournament']);
    }

    public function test_approve_entry(): void
    {
        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/entries/{$entry->id}/approve", ['status' => 'approved']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_reject_entry(): void
    {
        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/entries/{$entry->id}/reject", ['status' => 'rejected']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_approve_entry_forbidden_for_player(): void
    {
        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/entries/{$entry->id}/approve", ['status' => 'approved']);

        $response->assertStatus(403);
    }

    public function test_admin_add_entry(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/entries/admin-add', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $this->player->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.source', 'admin_added');
    }

    public function test_admin_add_duplicate_rejected(): void
    {
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/entries/admin-add', [
                'tournament_id' => $this->tournament->id,
                'player_id' => $this->player->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['player']);
    }

    public function test_set_seed(): void
    {
        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/entries/{$entry->id}/seed", ['seed' => 1]);

        $response->assertOk()
            ->assertJsonPath('data.seed', 1);
    }

    public function test_clear_seed(): void
    {
        $entry = TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'approved',
            'seed' => 1,
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/entries/{$entry->id}/seed", ['seed' => null]);

        $response->assertOk()
            ->assertJsonPath('data.seed', null);
    }

    public function test_my_entries(): void
    {
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->playerUser)
            ->getJson('/api/entries/mine');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_summary_entries(): void
    {
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        [$u2, $p2] = $this->createPlayerUser('P2');
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $p2->id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/entries");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_summary_entries_filter_status(): void
    {
        TournamentEntry::create([
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/tournaments/{$this->tournament->id}/entries?status=pending");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
