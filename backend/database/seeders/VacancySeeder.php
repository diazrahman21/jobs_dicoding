<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Seeder;

class VacancySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recruiter = User::query()
            ->where('role', UserRole::Recruiter->value)
            ->first()
            ?? User::factory()->recruiter()->create();

        Vacancy::factory()->for($recruiter)->create([
            'title' => 'Backend Engineer',
            'company_name' => 'PT Teknologi Nusantara',
            'location' => 'Jakarta',
            'employment_type' => 'Full-time',
            'salary_min' => 8_000_000,
            'salary_max' => 15_000_000,
            'description' => 'Kami mencari Backend Engineer yang berpengalaman membangun layanan berskala besar.',
            'requirements' => 'Menguasai PHP/Laravel, MySQL, REST API, dan Git.',
        ]);

        Vacancy::factory()->for($recruiter)->create([
            'title' => 'Frontend Engineer',
            'company_name' => 'PT Digital Kreasi',
            'location' => 'Bandung',
            'employment_type' => 'Full-time',
            'salary_min' => 7_000_000,
            'salary_max' => 13_000_000,
            'description' => 'Bergabunglah membangun antarmuka web yang cepat dan aksesibel.',
            'requirements' => 'Menguasai JavaScript, TypeScript, React/Next.js, dan CSS modern.',
        ]);

        Vacancy::factory()->for($recruiter)->create([
            'title' => 'UI/UX Designer',
            'company_name' => 'PT Karya Digital',
            'location' => 'Yogyakarta',
            'employment_type' => 'Contract',
            'salary_min' => 6_000_000,
            'salary_max' => 11_000_000,
            'description' => 'Rancang pengalaman pengguna yang intuitif untuk produk digital kami.',
            'requirements' => 'Menguasai Figma, riset pengguna, dan design system.',
        ]);

        Vacancy::factory()->count(17)->for($recruiter)->create();
    }
}
