<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacancyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'is_saved' => $this->resolveIsSaved($request),
            'title' => $this->title,
            'position' => $this->position,
            'company_name' => $this->company_name,
            'location' => $this->location,
            'employment_type' => $this->employment_type->value,
            'candidates_needed' => $this->candidates_needed,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'experience_level' => $this->experience_level,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'show_salary' => (bool) $this->show_salary,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function resolveIsSaved(Request $request): bool
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->isJobSeeker()) {
            return false;
        }

        return $user->savedVacancies()->where('vacancies.id', $this->id)->exists();
    }
}