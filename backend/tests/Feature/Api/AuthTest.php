<?php

namespace Tests\Feature\Api;

class AuthTest extends ApiTestCase
{
    public function test_register_creates_user_and_player(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'player'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'new@test.com']);
        $this->assertDatabaseHas('players', ['name' => 'New User']);
    }

    public function test_register_validates_required_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_validates_unique_email(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Dup',
            'email' => 'player@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_validates_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'User',
            'email' => 'x@test.com',
            'password' => 'password123',
            'password_confirmation' => 'wrongconfirm',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_login_returns_token(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'player@test.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'player@test.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_validates_required_fields(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_logout_revokes_token(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->postJson('/api/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);
    }

    public function test_logout_requires_auth(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_me_returns_current_user(): void
    {
        $response = $this->actingAs($this->playerUser)
            ->getJson('/api/me');

        $response->assertOk()
            ->assertJsonPath('data.id', $this->playerUser->id)
            ->assertJsonPath('data.email', 'player@test.com');
    }

    public function test_me_requires_auth(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }
}
