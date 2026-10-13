<?php

namespace Tests\Unit;

use App\Enums\EmploymentType;
use App\Http\Requests\StoreVacancyRequest;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class VacancyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function search_by_title_matches_partial_term(): void
    {
        Vacancy::factory()->create(['title' => 'Backend Engineer']);
        Vacancy::factory()->create(['title' => 'UI/UX Designer']);

        $results = Vacancy::query()->searchByTitle('Backend')->get();

        $this->assertCount(1, $results);
        $this->assertSame('Backend Engineer', $results->first()->title);
    }

    #[Test]
    public function search_by_title_is_case_insensitive(): void
    {
        Vacancy::factory()->create(['title' => 'Backend Engineer']);

        $this->assertCount(1, Vacancy::query()->searchByTitle('backend')->get());
        $this->assertCount(1, Vacancy::query()->searchByTitle('ENGINEER')->get());
    }

    #[Test]
    public function search_by_title_returns_all_when_term_is_empty(): void
    {
        Vacancy::factory()->count(3)->create();

        $this->assertCount(3, Vacancy::query()->searchByTitle('')->get());
        $this->assertCount(3, Vacancy::query()->searchByTitle('   ')->get());
        $this->assertCount(3, Vacancy::query()->searchByTitle(null)->get());
    }

    #[Test]
    public function store_request_rejects_empty_title(): void
    {
        $validator = $this->validate(array_merge($this->validPayload(), ['title' => '']));

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    #[Test]
    public function store_request_rejects_invalid_employment_type(): void
    {
        $validator = $this->validate(array_merge($this->validPayload(), [
            'employment_type' => 'Not-A-Real-Type',
        ]));

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('employment_type', $validator->errors()->toArray());
    }

    #[Test]
    public function store_request_rejects_salary_max_lower_than_salary_min(): void
    {
        $validator = $this->validate(array_merge($this->validPayload(), [
            'salary_min' => 9_000_000,
            'salary_max' => 5_000_000,
        ]));

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('salary_max', $validator->errors()->toArray());
    }

    #[Test]
    public function store_request_accepts_valid_payload(): void
    {
        $validator = $this->validate($this->validPayload());

        $this->assertFalse($validator->fails(), (string) $validator->errors());
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validate(array $payload): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($payload, (new StoreVacancyRequest)->rules());
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
