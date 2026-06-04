<?php

namespace App\Services;

use App\Models\Player;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole('player');

        Player::create([
            'user_id' => $user->id,
            'name' => $data['name'],
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return ['user' => $user->load('player'), 'token' => $token];
    }

    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return ['user' => $user->load('player'), 'token' => $token];
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if (method_exists($token, 'delete')) {
            $token->delete();
        } else {
            $user->tokens()->delete();
        }
    }

    public function me(User $user): User
    {
        return $user->load(['player', 'roles']);
    }
}
