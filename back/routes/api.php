<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes here are automatically prefixed with /api (see bootstrap/app.php
| or RouteServiceProvider).
|
| Auth guard used: 'api' (jwt driver — see config/auth.php)
*/

/*
|--------------------------------------------------------------------------
| Public Auth routes (no token required)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']); // POST /api/auth/register
    Route::post('login',    [AuthController::class, 'login']);    // POST /api/auth/login
});

/*
|--------------------------------------------------------------------------
| Protected Auth routes (valid JWT required)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->middleware('auth:api')->group(function () {
    Route::get('me',      [AuthController::class, 'me']);      // GET  /api/auth/me
    Route::post('refresh',[AuthController::class, 'refresh']); // POST /api/auth/refresh
    Route::post('logout', [AuthController::class, 'logout']);  // POST /api/auth/logout
});

/*
|--------------------------------------------------------------------------
| Protected API routes (example structure — add your resource controllers here)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    // TODO: add product, order, cart routes here
    // Route::apiResource('products', ProductController::class);
});
