<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVacancyRequest;
use App\Http\Requests\UpdateVacancyRequest;
use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class VacancyController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $vacancies = Vacancy::query()
            ->searchByTitle($request->query('search'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return VacancyResource::collection($vacancies);
    }

    public function store(StoreVacancyRequest $request): JsonResponse
    {
        $vacancy = $request->user()
            ->vacancies()
            ->create($request->validated());

        return (new VacancyResource($vacancy))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Vacancy $vacancy): VacancyResource
    {
        return new VacancyResource($vacancy);
    }

    public function update(UpdateVacancyRequest $request, Vacancy $vacancy): VacancyResource
    {
        Gate::authorize('update', $vacancy);

        $vacancy->update($request->validated());

        return new VacancyResource($vacancy);
    }

    public function destroy(Vacancy $vacancy): Response
    {
        Gate::authorize('delete', $vacancy);

        $vacancy->delete();

        return response()->noContent();
    }
}
