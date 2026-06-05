<?php

namespace Tests\Feature\Api;

use App\Models\Break_;
use App\Models\Frame;
use App\Models\Match_;
use App\Models\Round;
use App\Models\Tournament;

class BreakTest extends ApiTestCase
{
    private Match_ $match;
    private Frame $frame;

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
            'umpire_id' => $this->umpireUser->id,
        ]);
        $this->frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
            'status' => 'in_progress',
        ]);
    }

    public function test_store_break_umpire(): void
    {
        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 45,
                'balls' => ['red', 'black', 'red', 'pink', 'red', 'blue'],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.player_id', $this->player->id)
            ->assertJsonPath('data.points', 45);

        $this->assertDatabaseHas('breaks', [
            'frame_id' => $this->frame->id,
            'player_id' => $this->player->id,
            'points' => 45,
        ]);
    }

    public function test_store_break_admin(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 20,
            ]);

        $response->assertStatus(201);
    }

    public function test_store_break_forbidden_for_player(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 20,
            ]);

        $response->assertStatus(403);
    }

    public function test_store_break_validates_player_id(): void
    {
        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'points' => 20,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['player_id']);
    }

    public function test_store_break_auto_increments_sort_order(): void
    {
        Break_::create([
            'frame_id' => $this->frame->id, 'player_id' => $this->player->id,
            'points' => 10, 'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player2->id,
                'points' => 5,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.sort_order', 2);
    }

    public function test_store_break_recalculates_frame_scores(): void
    {
        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 50,
            ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player2->id,
                'points' => 30,
            ]);

        $this->frame->refresh();
        $this->assertEquals(50, $this->frame->score1);
        $this->assertEquals(30, $this->frame->score2);
    }

    public function test_store_foul_break_adds_points_to_opponent(): void
    {
        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 0,
                'foul_points' => 4,
                'is_foul_turn' => true,
            ]);

        $this->frame->refresh();
        // Player1's foul_points go to player2's score
        $this->assertEquals(0, $this->frame->score1);
        $this->assertEquals(4, $this->frame->score2);
    }

    public function test_store_break_tracks_high_break(): void
    {
        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 60,
            ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$this->frame->id}/breaks", [
                'player_id' => $this->player2->id,
                'points' => 40,
            ]);

        $this->frame->refresh();
        $this->assertEquals(60, $this->frame->high_break_value);
        $this->assertEquals($this->player->id, $this->frame->high_break_player_id);
    }

    public function test_update_break(): void
    {
        $break = Break_::create([
            'frame_id' => $this->frame->id,
            'player_id' => $this->player->id,
            'points' => 30, 'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->putJson("/api/breaks/{$break->id}", [
                'points' => 55,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.points', 55);

        // Frame score should be recalculated
        $this->frame->refresh();
        $this->assertEquals(55, $this->frame->score1);
    }

    public function test_update_break_forbidden_for_player(): void
    {
        $break = Break_::create([
            'frame_id' => $this->frame->id,
            'player_id' => $this->player->id,
            'points' => 30, 'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->playerUser)
            ->putJson("/api/breaks/{$break->id}", ['points' => 55]);

        $response->assertStatus(403);
    }

    public function test_delete_break(): void
    {
        $break = Break_::create([
            'frame_id' => $this->frame->id,
            'player_id' => $this->player->id,
            'points' => 30, 'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->deleteJson("/api/breaks/{$break->id}");

        $response->assertOk();
        $this->assertSoftDeleted('breaks', ['id' => $break->id]);

        // Frame score should be recalculated to 0
        $this->frame->refresh();
        $this->assertEquals(0, $this->frame->score1);
    }

    public function test_delete_break_forbidden_for_player(): void
    {
        $break = Break_::create([
            'frame_id' => $this->frame->id,
            'player_id' => $this->player->id,
            'points' => 30, 'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->playerUser)
            ->deleteJson("/api/breaks/{$break->id}");

        $response->assertStatus(403);
    }
}
