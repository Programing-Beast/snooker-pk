<?php

namespace App\Http\Middleware;

use App\Models\Match_;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAssignedUmpire
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admins pass unconditionally
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Resolve match from route parameters
        $match = $request->route('match')
            ?? $request->route('frame')?->match
            ?? $request->route('break_')?->frame?->match;

        if ($match instanceof Match_ && $match->umpire_id !== $user->id) {
            abort(403, 'You are not the assigned umpire for this match.');
        }

        return $next($request);
    }
}
