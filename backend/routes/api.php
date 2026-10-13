<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VacancyController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/vacancies', [VacancyController::class, 'index']);
Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:recruiter')->group(function () {
        Route::post('/vacancies', [VacancyController::class, 'store']);
        Route::match(['put', 'patch'], '/vacancies/{vacancy}', [VacancyController::class, 'update']);
        Route::delete('/vacancies/{vacancy}', [VacancyController::class, 'destroy']);
    });

    Route::middleware('role:job_seeker')->group(function () {
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/vacancies/{vacancy}/applications', [ApplicationController::class, 'store']);
    });
});
