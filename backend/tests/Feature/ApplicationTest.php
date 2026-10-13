<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_job_seeker_can_apply_to_a_vacancy(): void
    {
        $seeker = User::factory()->jobSeeker()->create();
        $vacancy = Vacancy::factory()->create();

        Sanctum::actingAs($seeker);

        $response = $this->postJson("/api/vacancies/{$vacancy->id}/applications");

        $response->assertCreated()
            ->assertJsonPath('data.vacancy_id', $vacancy->id)
            ->assertJsonPath('data.status', 'submitted');

        $this->assertDatabaseHas('applications', [
            'user_id' => $seeker->id,
            'vacancy_id' => $vacancy->id,
        ]);
    }

    #[Test]
    public function a_job_seeker_cannot_apply_twice(): void
    {
        $seeker = User::factory()->jobSeeker()->create();
        $vacancy = Vacancy::factory()->create();

        Application::factory()->create([
            'user_id' => $seeker->id,
            'vacancy_id' => $vacancy->id,
        ]);

        Sanctum::actingAs($seeker);

        $this->postJson("/api/vacancies/{$vacancy->id}/applications")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['vacancy']);
    }

    #[Test]
    public function a_recruiter_cannot_apply(): void
    {
        $recruiter = User::factory()->recruiter()->create();
        $vacancy = Vacancy::factory()->create();

        Sanctum::actingAs($recruiter);

        $this->postJson("/api/vacancies/{$vacancy->id}/applications")
            ->assertForbidden();
    }

    #[Test]
    public function a_guest_cannot_apply(): void
    {
        $vacancy = Vacancy::factory()->create();

        $this->postJson("/api/vacancies/{$vacancy->id}/applications")
            ->assertUnauthorized();
    }

    #[Test]
    public function a_job_seeker_lists_only_their_own_applications(): void
    {
        $seeker = User::factory()->jobSeeker()->create();
        $otherSeeker = User::factory()->jobSeeker()->create();

        Application::factory()->count(2)->create(['user_id' => $seeker->id]);
        Application::factory()->create(['user_id' => $otherSeeker->id]);

        Sanctum::actingAs($seeker);

        $response = $this->getJson('/api/applications');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    ['id', 'vacancy_id', 'status', 'created_at', 'vacancy' => ['id', 'title']],
                ],
            ]);
    }
}
