<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\KhqrController;

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

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Protected admin routes
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Products CRUD — admin only
    Route::post('/products',           [ProductController::class, 'store']);
    Route::post('/products/{product}', [ProductController::class, 'update']); // POST + _method=PUT
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes — Phase 1: Cart, Checkout, KHQR
|--------------------------------------------------------------------------
|
| JWT Auth middleware: 'auth:api'  (tymon/jwt-auth)
|
| Cart supports both:
|   - Authenticated users  → tied to user_id via JWT
|   - Guests               → tied to session_id via X-Session-Id header
|
*/

// ── Cart (public + authenticated) ────────────────────────────────────────────
Route::prefix('cart')->group(function () {
    Route::get('/',                 [CartController::class, 'index']);       // GET  /api/cart
    Route::post('/items',           [CartController::class, 'addItem']);     // POST /api/cart/items
    Route::put('/items/{cartItem}', [CartController::class, 'updateItem']);  // PUT  /api/cart/items/{id}
    Route::delete('/items/{cartItem}', [CartController::class, 'removeItem']); // DELETE /api/cart/items/{id}
    Route::delete('/',              [CartController::class, 'clear']);       // DELETE /api/cart
});

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    // Checkout
    Route::post('/checkout',  [CheckoutController::class, 'checkout']);  // POST /api/checkout
    Route::get('/orders',     [CheckoutController::class, 'index']);     // GET  /api/orders
    Route::get('/orders/{order}', [CheckoutController::class, 'show']); // GET  /api/orders/{id}

    // KHQR polling + refresh
    Route::get('/orders/{order}/payment/status',  [KhqrController::class, 'pollStatus']); // GET
    Route::post('/orders/{order}/khqr/refresh',   [KhqrController::class, 'refresh']);    // POST
});

// ── Dev-only: manually trigger payment confirmation ───────────────────────────
// Remove this entire block before going to production (or guard with APP_ENV check).
if (app()->environment('local', 'development')) {
    Route::middleware('auth:api')
        ->post('/dev/orders/{order}/force-pay', [KhqrController::class, 'devForcePay']);
}