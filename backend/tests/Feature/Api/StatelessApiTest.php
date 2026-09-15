<?php

namespace Tests\Feature\Api;

use Illuminate\Contracts\Http\Kernel;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class StatelessApiTest extends ApiTestCase
{
    /**
     * The SPA authenticates with bearer tokens, so /api/* must never be stateful.
     *
     * With statefulApi() enabled, Sanctum prepends EnsureFrontendRequestsAreStateful
     * to the api group; that middleware attaches the `web` group (session +
     * ValidateCsrfToken) whenever the request Origin matches config('sanctum.stateful').
     * That list defaults to localhost, localhost:3000, 127.0.0.1, 127.0.0.1:8000 and
     * the APP_URL host -- so a browser on localhost:3000, or a SPA served from the
     * same domain as the API, gets "CSRF token mismatch." on every write.
     *
     * This asserts the middleware is absent. It cannot be caught by an HTTP-level
     * test: ValidateCsrfToken short-circuits on runningUnitTests(), so the 419 never
     * surfaces in the suite.
     */
    public function test_api_middleware_group_is_not_stateful(): void
    {
        $groups = app(Kernel::class)->getMiddlewareGroups();

        $this->assertArrayHasKey('api', $groups);
        $this->assertNotContains(
            EnsureFrontendRequestsAreStateful::class,
            $groups['api'],
            'The api middleware group must stay stateless — see the note above.'
        );
    }

    public function test_token_auth_is_accepted_from_a_browser_origin(): void
    {
        $token = $this->admin->createToken('origin-test')->plainTextToken;

        $response = $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/admin',
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/tournaments', [
            'name' => 'Origin Header Cup',
            'slug' => 'origin-header-cup',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tournaments', ['slug' => 'origin-header-cup']);
    }

    public function test_unauthenticated_write_is_rejected(): void
    {
        $this->withHeaders(['Origin' => 'http://localhost:3000'])
            ->postJson('/api/tournaments', ['name' => 'No Auth', 'slug' => 'no-auth'])
            ->assertStatus(401);
    }
}
