<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vacancy>
 */
class VacancyFactory extends Factory
{
    protected $model = Vacancy::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $salaryMin = fake()->numberBetween(4_000_000, 15_000_000);

        return [
            'user_id' => User::factory()->recruiter(),
            'title' => fake()->randomElement([
                'Backend Engineer',
                'Frontend Engineer',
                'Full Stack Developer',
                'Mobile Developer',
                'DevOps Engineer',
                'Data Engineer',
                'Data Scientist',
                'QA Engineer',
                'UI/UX Designer',
                'Product Manager',
                'System Analyst',
                'Cloud Architect',
                'Security Engineer',
                'Machine Learning Engineer',
                'Technical Writer',
            ]),
            'company_name' => fake()->randomElement([
                'PT Teknologi Nusantara',
                'PT Digital Kreasi',
                'PT Solusi Cerdas',
                'PT Data Prima',
                'PT Awan Inovasi',
                'PT Karya Digital',
                'PT Sinergi Teknologi',
                'PT Startup Indonesia',
            ]),
            'location' => fake()->randomElement([
                'Jakarta',
                'Bandung',
                'Surabaya',
                'Yogyakarta',
                'Medan',
                'Semarang',
                'Denpasar',
                'Makassar',
                'Remote',
            ]),
            'employment_type' => fake()->randomElement(EmploymentType::values()),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMin + fake()->numberBetween(2_000_000, 10_000_000),
            'description' => fake()->paragraphs(3, true),
            'requirements' => fake()->paragraphs(2, true),
        ];
    }
}
