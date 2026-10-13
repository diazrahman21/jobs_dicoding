<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->recruiter()->create([
            'name' => 'Recruiter Demo',
            'email' => 'recruiter@dicoding.jobs',
            'password' => 'password',
        ]);

        User::factory()->jobSeeker()->create([
            'name' => 'Job Seeker Demo',
            'email' => 'seeker@dicoding.jobs',
            'password' => 'password',
        ]);

        $this->call(VacancySeeder::class);
    }
}
