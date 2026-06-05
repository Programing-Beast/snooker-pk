<?php

namespace App\Services;

use App\Models\Match_;
use App\Models\Player;
use App\Models\Tournament;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PlayerService
{
    public function list(array $filters): LengthAwarePaginator
    {
        $query = Player::with('phones');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhereHas('phones', fn ($pq) => $pq->where('phone', 'like', '%'.$search.'%'));
            });
        }

        if (! empty($filters['phone'])) {
            $query->whereHas('phones', fn ($q) => $q->where('phone', 'like', '%'.$filters['phone'].'%'));
        }

        if (! empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['country_code'])) {
            $query->where('country_code', $filters['country_code']);
        }

        $sortBy = $filters['sort_by'] ?? 'ranking_points';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        return $query->orderBy($sortBy, $sortDir)
            ->paginate($filters['per_page'] ?? 15);
    }

    public function show(Player $player): Player
    {
        $player->load(['user', 'phones']);

        // Compute match stats
        $matches = Match_::where(function ($q) use ($player) {
            $q->where('player1_id', $player->id)
                ->orWhere('player2_id', $player->id);
        })->whereIn('status', ['completed', 'walkover'])->get();

        $wins = $matches->filter(fn ($m) => $m->winner_id === $player->id)->count();
        $total = $matches->count();

        $player->setAttribute('matches_played', $total);
        $player->setAttribute('wins', $wins);
        $player->setAttribute('win_rate', $total > 0 ? round($wins / $total * 100) : null);
        $titlesCount = Tournament::where('winner_id', $player->id)->count();
        $player->setAttribute('titles_count', $titlesCount);

        $highBreak = \App\Models\Break_::where('player_id', $player->id)
            ->where('is_foul_turn', false)
            ->max('points');
        $player->setAttribute('high_break', $highBreak);

        return $player;
    }

    public function create(array $data): Player
    {
        return Player::create($data)->load('phones');
    }

    public function update(Player $player, array $data): Player
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if ($player->photo_path) {
                Storage::disk('public')->delete($player->photo_path);
            }
            $data['photo_path'] = $data['photo']->store('players', 'public');
            unset($data['photo']);
        }

        $player->update($data);

        return $player->fresh();
    }

    public function history(Player $player, array $filters): LengthAwarePaginator
    {
        return Match_::where(function ($q) use ($player) {
            $q->where('player1_id', $player->id)
                ->orWhere('player2_id', $player->id);
        })
            ->whereIn('status', ['completed', 'walkover'])
            ->with(['player1', 'player2', 'winner', 'tournament', 'round'])
            ->orderByDesc('scheduled_at')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function upcoming(Player $player, array $filters): Collection
    {
        return Match_::where(function ($q) use ($player) {
            $q->where('player1_id', $player->id)
                ->orWhere('player2_id', $player->id);
        })
            ->where('status', 'scheduled')
            ->with(['player1', 'player2', 'tournament', 'round'])
            ->orderBy('scheduled_at')
            ->limit(10)
            ->get();
    }
}
