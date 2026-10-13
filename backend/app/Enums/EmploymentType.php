<?php

namespace App\Enums;

enum EmploymentType: string
{
    case FullTime = 'Full-time';
    case PartTime = 'Part-time';
    case Contract = 'Contract';
    case Internship = 'Internship';
    case Freelance = 'Freelance';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
