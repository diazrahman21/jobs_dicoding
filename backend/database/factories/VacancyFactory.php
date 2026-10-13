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
            'position' => fake()->randomElement([
                'Android Developer',
                'iOS Developer',
                'Frontend Developer',
                'Backend Developer',
                'Full Stack Developer',
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
            'candidates_needed' => fake()->numberBetween(1, 10),
            'deadline' => fake()->dateTimeBetween('now', '+2 months')->format('Y-m-d'),
            'experience_level' => fake()->randomElement([
                'Fresh Graduate',
                '1-3 tahun',
                '3-5 tahun',
                '5-10 tahun',
                'Lebih dari 10 tahun',
            ]),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMin + fake()->numberBetween(2_000_000, 10_000_000),
            'show_salary' => fake()->boolean(70),
            'description' => fake()->paragraphs(3, true),
            'requirements' => fake()->paragraphs(2, true),
        ];
    }
}
