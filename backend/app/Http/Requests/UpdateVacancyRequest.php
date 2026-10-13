<?php

namespace App\Http\Requests;

use App\Enums\EmploymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'employment_type' => ['sometimes', 'required', 'string', Rule::enum(EmploymentType::class)],
            'candidates_needed' => ['nullable', 'integer', 'min:1'],
            'deadline' => ['nullable', 'date'],
            'experience_level' => ['nullable', 'string', 'max:50'],
            'description' => ['sometimes', 'required', 'string'],
            'requirements' => ['nullable', 'string'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'show_salary' => ['boolean'],
        ];
    }
}
