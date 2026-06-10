<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Public: leads (from landing form)
Route::post('/leads', [LeadController::class, 'store']);

// Public: projects list (for landing page)
Route::get('/projects', [ProjectController::class, 'index']);

// Public: portfolio (for landing page)
Route::get('/portfolio', [PortfolioController::class, 'index']);

// Protected (admin only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',     [AuthController::class, 'me']);

    Route::post('/projects',         [ProjectController::class, 'store']);
    Route::post('/projects/{project}', [ProjectController::class, 'update']); // POST + _method=PUT for FormData
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    Route::get('/leads', [LeadController::class, 'index']);

    Route::post('/portfolio',                   [PortfolioController::class, 'store']);
    Route::delete('/portfolio/{portfolioItem}', [PortfolioController::class, 'destroy']);
});
