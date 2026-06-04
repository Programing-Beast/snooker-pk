<?php

namespace Tests\Feature\Api;

use App\Models\Frame;
use App\Models\Match_;
use App\Models\Round;
use App\Models\Tournament;

class FrameTest extends ApiTestCase
{
    private Match_ $match;

    protected function setUp(): void
    {
        parent::setUp();

        [$u2, $this->player2] = $this->createPlayerUser('Player 2');

        $tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $round = Round::create([
            'tournament_id' => $tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 3,
        ]);
        $this->match = Match_::create([
            'tournament_id' => $tournament->id,
            'round_id' => $round->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $this->player2->id,
            'status' => 'live',
        ]);
    }

    public function test_store_frame_umpire(): void
    {
        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/matches/{$this->match->id}/frames", [
                'frame_no' => 1,
                'breaker_id' => $this->player->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.frame_no', 1)
            ->assertJsonPath('data.breaker_id', $this->player->id);

        $this->assertDatabaseHas('frames', [
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);
    }

    public function test_store_frame_admin(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/matches/{$this->match->id}/frames", [
                'frame_no' => 1,
            ]);

        $response->assertStatus(201);
    }

    public function test_store_frame_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson("/api/matches/{$this->match->id}/frames", [
                'frame_no' => 1,
            ]);

        $response->assertStatus(403);
    }

    public function test_store_frame_auto_assigns_frame_no(): void
    {
        $this->match->update(['current_frame_no' => 3]);

        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/matches/{$this->match->id}/frames", []);

        $response->assertStatus(201)
            ->assertJsonPath('data.frame_no', 3);
    }

    public function test_update_frame(): void
    {
        $frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->putJson("/api/frames/{$frame->id}", [
                'winner_id' => $this->player->id,
                'status' => 'completed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.winner_id', $this->player->id)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_update_frame_recalculates_match_scores(): void
    {
        $frame1 = Frame::create([
            'match_id' => $this->match->id, 'frame_no' => 1,
            'status' => 'completed', 'winner_id' => $this->player->id,
        ]);
        $frame2 = Frame::create([
            'match_id' => $this->match->id, 'frame_no' => 2,
            'status' => 'in_progress',
        ]);

        $this->actingAs($this->umpireUser)
            ->putJson("/api/frames/{$frame2->id}", [
                'winner_id' => $this->player->id,
                'status' => 'completed',
            ]);

        $this->match->refresh();
        $this->assertEquals(2, $this->match->score1);
        $this->assertEquals(0, $this->match->score2);
    }

    public function test_update_frame_forbidden_for_player(): void
    {
        $frame = Frame::create([
            'match_id' => $this->match->id, 'frame_no' => 1,
        ]);

        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/frames/{$frame->id}", ['status' => 'completed']);

        $response->assertStatus(403);
    }
}
