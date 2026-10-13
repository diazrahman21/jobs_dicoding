<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_registers_a_recruiter_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Recruiter Baru',
            'email' => 'recruiter@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => UserRole::Recruiter->value,
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', UserRole::Recruiter->value)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'recruiter@example.com',
            'role' => UserRole::Recruiter->value,
        ]);
    }

    #[Test]
    public function it_registers_a_job_seeker(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Job Seeker Baru',
            'email' => 'seeker@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => UserRole::JobSeeker->value,
        ])->assertCreated()
            ->assertJsonPath('user.role', UserRole::JobSeeker->value);
    }

    #[Test]
    public function it_rejects_registration_with_invalid_data(): void
    {
        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'role' => 'admin',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    #[Test]
    public function it_rejects_weak_password_registration(): void
    {
        $this->postJson('/api/register', [
            'name' => 'User Baru',
            'email' => 'weak@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::JobSeeker->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    public function it_rejects_invalid_name_registration(): void
    {
        $this->postJson('/api/register', [
            'name' => 'User123!',
            'email' => 'name@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => UserRole::JobSeeker->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function it_rejects_duplicate_email_registration(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Duplikat',
            'email' => 'taken@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => UserRole::JobSeeker->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_logs_in_with_valid_credentials(): void
    {
        $user = User::factory()->jobSeeker()->create([
            'email' => 'seeker@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'seeker@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['user', 'token']);
    }

    #[Test]
    public function it_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'seeker@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'seeker@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_returns_the_authenticated_user(): void
    {
        $user = User::factory()->recruiter()->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', UserRole::Recruiter->value);
    }

    #[Test]
    public function it_revokes_the_token_on_logout(): void
    {
        $user = User::factory()->jobSeeker()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    #[Test]
    public function me_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }
}
