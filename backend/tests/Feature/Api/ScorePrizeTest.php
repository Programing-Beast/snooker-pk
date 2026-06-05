<?php

namespace Tests\Feature\Api;

use App\Models\Frame;
use App\Models\Match_;
use App\Models\Prize;
use App\Models\Round;
use App\Models\Tournament;

class ScorePrizeTest extends ApiTestCase
{
    private Tournament $tournament;
    private Round $round;
    private Match_ $match;

    protected function setUp(): void
    {
        parent::setUp();

        [$u2, $this->player2] = $this->createPlayerUser('Player 2');

        $this->tournament = Tournament::create([
            'name' => 'T1', 'slug' => 't1',
            'start_date' => '2026-07-01', 'end_date' => '2026-07-05',
        ]);
        $this->round = Round::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Final', 'sort_order' => 1, 'frames_to_win' => 5,
        ]);
        $this->match = Match_::create([
            'tournament_id' => $this->tournament->id,
            'round_id' => $this->round->id,
            'position' => 1,
            'player1_id' => $this->player->id,
            'player2_id' => $this->player2->id,
            'status' => 'live',
            'umpire_id' => $this->umpireUser->id,
        ]);
    }

    private $player2;

    public function test_century_break_creates_pending_award(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Century Break', 'amount' => 10000,
            'type' => 'custom', 'score_threshold' => 100,
            'multiple' => true, 'sort_order' => 10,
        ]);

        $frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 120,
                'is_foul_turn' => false,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('prize_awards', [
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'category' => 'score_prize',
            'status' => 'pending',
            'amount' => '10000.00',
        ]);
    }

    public function test_50_break_creates_pending_award(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => '50+ Break', 'amount' => 2000,
            'type' => 'custom', 'score_threshold' => 50,
            'multiple' => true, 'sort_order' => 11,
        ]);

        $frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $response = $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 65,
                'is_foul_turn' => false,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('prize_awards', [
            'tournament_id' => $this->tournament->id,
            'player_id' => $this->player->id,
            'category' => 'score_prize',
            'status' => 'pending',
        ]);
    }

    public function test_foul_turn_does_not_trigger_score_prize(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Century Break', 'amount' => 10000,
            'type' => 'custom', 'score_threshold' => 100,
            'multiple' => true, 'sort_order' => 10,
        ]);

        $frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 120,
                'is_foul_turn' => true,
            ]);

        $this->assertDatabaseMissing('prize_awards', [
            'player_id' => $this->player->id,
            'category' => 'score_prize',
        ]);
    }

    public function test_multiple_awards_for_same_player(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Century Break', 'amount' => 10000,
            'type' => 'custom', 'score_threshold' => 100,
            'multiple' => true, 'sort_order' => 10,
        ]);

        $frame1 = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $frame2 = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 2,
        ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame1->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 110,
                'is_foul_turn' => false,
            ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame2->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 105,
                'is_foul_turn' => false,
            ]);

        $count = \App\Models\PrizeAward::where('player_id', $this->player->id)
            ->where('category', 'score_prize')
            ->count();

        $this->assertEquals(2, $count);
    }

    public function test_non_multiple_prize_only_awarded_once(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Highest Break', 'amount' => 15000,
            'type' => 'custom', 'score_threshold' => 100,
            'multiple' => false, 'sort_order' => 10,
        ]);

        $frame1 = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $frame2 = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 2,
        ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame1->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 110,
                'is_foul_turn' => false,
            ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame2->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 130,
                'is_foul_turn' => false,
            ]);

        $count = \App\Models\PrizeAward::where('player_id', $this->player->id)
            ->where('category', 'score_prize')
            ->count();

        $this->assertEquals(1, $count);
    }

    public function test_below_threshold_no_award(): void
    {
        Prize::create([
            'tournament_id' => $this->tournament->id,
            'position_label' => 'Century Break', 'amount' => 10000,
            'type' => 'custom', 'score_threshold' => 100,
            'multiple' => true, 'sort_order' => 10,
        ]);

        $frame = Frame::create([
            'match_id' => $this->match->id,
            'frame_no' => 1,
        ]);

        $this->actingAs($this->umpireUser)
            ->postJson("/api/frames/{$frame->id}/breaks", [
                'player_id' => $this->player->id,
                'points' => 90,
                'is_foul_turn' => false,
            ]);

        $this->assertDatabaseMissing('prize_awards', [
            'player_id' => $this->player->id,
            'category' => 'score_prize',
        ]);
    }
}
