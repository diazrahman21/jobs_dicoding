<?php

namespace App\Enums;

enum UserRole: string
{
    case Recruiter = 'recruiter';
    case JobSeeker = 'job_seeker';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::Recruiter => 'Recruiter',
            self::JobSeeker => 'Job Seeker',
        };
    }
}
