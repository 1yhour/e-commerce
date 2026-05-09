<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register
    |--------------------------------------------------------------------------
    */

    /**
     * POST /api/auth/register
     * Creates a new Customer account and returns a JWT.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8',
            'phone'      => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Resolve the default "Customer" role
        $customerRole = Role::where('name', 'Customer')->first();

        $user = User::create([
            'role_id'       => optional($customerRole)->id,
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'email'         => $request->email,
            'password_hash' => Hash::make($request->password),
            'phone'         => $request->phone,
        ]);

        $token = JWTAuth::fromUser($user);

        return $this->respondWithToken($token, $user, 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    /**
     * POST /api/auth/login
     * Validates credentials and returns a JWT.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // tymon/jwt-auth needs the guard column mapped; we pass credentials manually
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Could not create token.'], 500);
        }

        return $this->respondWithToken($token, $user);
    }

    /*
    |--------------------------------------------------------------------------
    | Me (authenticated user profile)
    |--------------------------------------------------------------------------
    */

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user (with role loaded).
     */
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = JWTAuth::parseToken()->authenticate();

        return response()->json($user->load('role'));
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    /**
     * POST /api/auth/refresh
     * Rotates the JWT and returns a fresh token.
     */
    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token cannot be refreshed.'], 401);
        }

        return $this->respondWithToken($newToken);
    }

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    /**
     * POST /api/auth/logout
     * Invalidates the current token (adds it to the blacklist).
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::parseToken()->invalidate();
        } catch (JWTException $e) {
            // Token already invalid / expired — still return 200
        }

        return response()->json(['message' => 'Successfully logged out.']);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper
    |--------------------------------------------------------------------------
    */

    private function respondWithToken(string $token, ?User $user = null, int $status = 200): JsonResponse
    {
        $payload = [
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => config('jwt.ttl') * 60, // seconds
        ];

        if ($user) {
            $payload['user'] = $user->load('role');
        }

        return response()->json($payload, $status);
    }
}
