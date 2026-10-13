<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                "regex:/^[\\p{L}\\s'.-]+$/u",
            ],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
                'confirmed',
                // minimal: 1 huruf besar, 1 huruf kecil, 1 angka
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/',
            ],
            'password_confirmation' => ['required', 'string', 'min:8', 'max:255'],
            'role' => ['required', 'string', Rule::enum(UserRole::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, tanda hubung, apostrof, dan titik.',
            'password.regex' => 'Password harus memiliki minimal 8 karakter, 1 huruf besar, 1 huruf kecil, dan 1 angka.',
        ];
    }
}
