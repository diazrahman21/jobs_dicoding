<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SavedVacancyApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function job_seeker_can_save_list_and_unsave_a_vacancy(): void
    {
        $vacancy = Vacancy::factory()->create();
        $seeker = User::factory()->jobSeeker()->create();
        Sanctum::actingAs($seeker);

        $this->postJson("/api/vacancies/{$vacancy->id}/save")
            ->assertCreated()
            ->assertJsonPath('saved', true);

        $this->getJson('/api/saved-vacancies')
            ->assertOk()
            ->assertJsonPath('data.0.id', $vacancy->id);

        $this->deleteJson("/api/vacancies/{$vacancy->id}/save")
            ->assertOk()
            ->assertJsonPath('saved', false);

        $this->getJson('/api/saved-vacancies')
            ->assertOk();

        $this->assertCount(0, $this->getJson('/api/saved-vacancies')->json('data'));
    }

    #[Test]
    public function saving_twice_does_not_duplicate(): void
    {
        $vacancy = Vacancy::factory()->create();
        $seeker = User::factory()->jobSeeker()->create();
        Sanctum::actingAs($seeker);

        $this->postJson("/api/vacancies/{$vacancy->id}/save")->assertCreated();
        $this->postJson("/api/vacancies/{$vacancy->id}/save")->assertCreated();

        $response = $this->getJson('/api/saved-vacancies');
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function guest_cannot_save_a_vacancy(): void
    {
        $vacancy = Vacancy::factory()->create();

        $this->postJson("/api/vacancies/{$vacancy->id}/save")
            ->assertUnauthorized();
    }

    #[Test]
    public function recruiter_cannot_save_a_vacancy(): void
    {
        $vacancy = Vacancy::factory()->create();
        Sanctum::actingAs(User::factory()->recruiter()->create());

        $this->postJson("/api/vacancies/{$vacancy->id}/save")
            ->assertForbidden();
    }
}