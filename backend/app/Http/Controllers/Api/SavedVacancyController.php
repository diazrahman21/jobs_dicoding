<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VacancyResource;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SavedVacancyController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $saved = $request->user()
            ->savedVacancies()
            ->latest('saved_vacancies.created_at')
            ->paginate(10)
            ->withQueryString();

        return VacancyResource::collection($saved);
    }

    public function store(Request $request, Vacancy $vacancy): JsonResponse
    {
        $request->user()->savedVacancies()->syncWithoutDetaching([$vacancy->id]);

        return response()->json([
            'message' => 'Lowongan berhasil disimpan.',
            'saved' => true,
        ], 201);
    }

    public function destroy(Request $request, Vacancy $vacancy): JsonResponse
    {
        $request->user()->savedVacancies()->detach($vacancy->id);

        return response()->json([
            'message' => 'Lowongan dihapus dari simpanan.',
            'saved' => false,
        ]);
    }
}