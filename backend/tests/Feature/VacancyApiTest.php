<?php

namespace Tests\Feature;

use App\Enums\EmploymentType;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class VacancyApiTest extends TestCase
{
    use RefreshDatabase;

    private function recruiter(): User
    {
        return User::factory()->recruiter()->create();
    }

    #[Test]
    public function it_lists_vacancies_with_pagination(): void
    {
        Vacancy::factory()->count(15)->create();

        $response = $this->getJson('/api/vacancies');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'user_id',
                        'title',
                        'company_name',
                        'location',
                        'employment_type',
                        'salary_min',
                        'salary_max',
                        'description',
                        'requirements',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'from', 'last_page', 'per_page', 'to', 'total'],
            ]);

        $this->assertCount(10, $response->json('data'));
        $this->assertSame(15, $response->json('meta.total'));
        $this->assertSame(10, $response->json('meta.per_page'));
    }

    #[Test]
    public function it_creates_a_vacancy(): void
    {
        $recruiter = $this->recruiter();
        Sanctum::actingAs($recruiter);

        $payload = $this->validPayload();

        $response = $this->postJson('/api/vacancies', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.title', $payload['title'])
            ->assertJsonPath('data.employment_type', $payload['employment_type'])
            ->assertJsonPath('data.user_id', $recruiter->id);

        $this->assertDatabaseHas('vacancies', [
            'title' => $payload['title'],
            'company_name' => $payload['company_name'],
            'employment_type' => $payload['employment_type'],
            'user_id' => $recruiter->id,
        ]);
    }

    #[Test]
    public function it_returns_422_when_payload_is_invalid(): void
    {
        Sanctum::actingAs($this->recruiter());

        $response = $this->postJson('/api/vacancies', [
            'title' => '',
            'employment_type' => 'Not-A-Real-Type',
            'salary_min' => 9_000_000,
            'salary_max' => 5_000_000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'title',
                'company_name',
                'location',
                'employment_type',
                'description',
                'salary_max',
            ]);
    }

    #[Test]
    public function guest_cannot_create_a_vacancy(): void
    {
        $this->postJson('/api/vacancies', $this->validPayload())
            ->assertUnauthorized();
    }

    #[Test]
    public function job_seeker_cannot_create_a_vacancy(): void
    {
        Sanctum::actingAs(User::factory()->jobSeeker()->create());

        $this->postJson('/api/vacancies', $this->validPayload())
            ->assertForbidden();
    }

    #[Test]
    public function recruiter_cannot_modify_another_recruiters_vacancy(): void
    {
        $vacancy = Vacancy::factory()->for($this->recruiter())->create();

        Sanctum::actingAs($this->recruiter());

        $this->putJson("/api/vacancies/{$vacancy->id}", ['title' => 'Hijacked'])
            ->assertForbidden();

        $this->deleteJson("/api/vacancies/{$vacancy->id}")
            ->assertForbidden();
    }

    #[Test]
    public function it_searches_vacancies_by_title(): void
    {
        Vacancy::factory()->create(['title' => 'Backend Engineer']);
        Vacancy::factory()->create(['title' => 'Frontend Engineer']);
        Vacancy::factory()->create(['title' => 'UI/UX Designer']);

        $response = $this->getJson('/api/vacancies?search=Backend');

        $response->assertOk();

        $titles = collect($response->json('data'))->pluck('title');

        $this->assertCount(1, $titles);
        $this->assertSame('Backend Engineer', $titles->first());
    }

    #[Test]
    public function it_shows_a_vacancy(): void
    {
        $vacancy = Vacancy::factory()->create();

        $this->getJson("/api/vacancies/{$vacancy->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $vacancy->id)
            ->assertJsonPath('data.title', $vacancy->title);
    }

    #[Test]
    public function it_returns_404_for_missing_vacancy(): void
    {
        $this->getJson('/api/vacancies/999999')
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }

    #[Test]
    public function it_updates_a_vacancy(): void
    {
        $recruiter = $this->recruiter();
        $vacancy = Vacancy::factory()->for($recruiter)->create(['title' => 'Old Title']);

        Sanctum::actingAs($recruiter);

        $this->putJson("/api/vacancies/{$vacancy->id}", ['title' => 'New Title'])
            ->assertOk()
            ->assertJsonPath('data.title', 'New Title');

        $this->assertDatabaseHas('vacancies', [
            'id' => $vacancy->id,
            'title' => 'New Title',
        ]);
    }

    #[Test]
    public function it_deletes_a_vacancy(): void
    {
        $recruiter = $this->recruiter();
        $vacancy = Vacancy::factory()->for($recruiter)->create();

        Sanctum::actingAs($recruiter);

        $this->deleteJson("/api/vacancies/{$vacancy->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('vacancies', ['id' => $vacancy->id]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'title' => 'Backend Engineer',
            'company_name' => 'PT Teknologi Nusantara',
            'location' => 'Jakarta',
            'employment_type' => EmploymentType::FullTime->value,
            'description' => 'Membangun layanan backend.',
            'requirements' => 'PHP, Laravel, MySQL.',
            'salary_min' => 5_000_000,
            'salary_max' => 10_000_000,
        ];
    }
}
