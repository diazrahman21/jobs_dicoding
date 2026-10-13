<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $applications = Application::query()
            ->with('vacancy')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return ApplicationResource::collection($applications);
    }

    public function store(Request $request, Vacancy $vacancy): JsonResponse
    {
        $user = $request->user();

        $alreadyApplied = Application::query()
            ->where('user_id', $user->id)
            ->where('vacancy_id', $vacancy->id)
            ->exists();

        if ($alreadyApplied) {
            throw ValidationException::withMessages([
                'vacancy' => ['Anda sudah melamar lowongan ini.'],
            ]);
        }

        $application = Application::create([
            'user_id' => $user->id,
            'vacancy_id' => $vacancy->id,
        ]);

        return (new ApplicationResource($application->load('vacancy')))
            ->response()
            ->setStatusCode(201);
    }
}
