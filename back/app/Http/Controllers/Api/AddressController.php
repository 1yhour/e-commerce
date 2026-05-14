<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    // ── GET /api/addresses ───────────────────────────────────────────────────

    /**
     * Returns all addresses for the authenticated user.
     *
     * Response shape (matches frontend Address interface exactly):
     * {
     *   "data": [
     *     {
     *       "id": "uuid",
     *       "label": "Home",
     *       "street": "123 Street Name",
     *       "city": "Phnom Penh",
     *       "full_address": "123 Street Name, Phnom Penh, Cambodia"
     *     }
     *   ]
     * }
     */
    public function index(): JsonResponse
    {
        $addresses = Address::forUser(auth('api')->id())
            ->defaultFirst()
            ->get()
            ->map(fn (Address $a) => $this->format($a));

        return response()->json(['data' => $addresses]);
    }

    // ── POST /api/addresses ──────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'label'       => ['nullable', 'string', 'max:50'],
            'street'      => ['required', 'string', 'max:255'],
            'city'        => ['nullable', 'string', 'max:100'],
            'is_default'  => ['sometimes', 'boolean'],
        ]);

        // If new address is set as default, unset all others first
        if ($request->boolean('is_default')) {
            Address::forUser(auth('api')->id())->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id'     => auth('api')->id(),
            'label'       => $request->label,
            'street'      => $request->street,
            'city'        => $request->city ?? 'Phnom Penh',
            'is_default'  => $request->boolean('is_default', false),
        ]);

        return response()->json([
            'message' => 'Address added.',
            'data'    => $this->format($address),
        ], 201);
    }

    // ── PUT /api/addresses/{address} ─────────────────────────────────────────

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($address);

        $request->validate([
            'label'       => ['nullable', 'string', 'max:50'],
            'street'      => ['sometimes', 'string', 'max:255'],
            'city'        => ['nullable', 'string', 'max:100'],
            'is_default'  => ['sometimes', 'boolean'],
        ]);

        if ($request->boolean('is_default')) {
            Address::forUser(auth('api')->id())->update(['is_default' => false]);
        }

        $address->update($request->only(
            'label', 'street', 'city', 'is_default'
        ));

        return response()->json([
            'message' => 'Address updated.',
            'data'    => $this->format($address->refresh()),
        ]);
    }

    // ── DELETE /api/addresses/{address} ─────────────────────────────────────

    public function destroy(Address $address): JsonResponse
    {
        $this->authorizeAddress($address);
        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Formats an Address into the exact shape the frontend expects.
     * Includes full_address which is computed by the model accessor.
     */
    private function format(Address $address): array
    {
        return [
            'id'           => $address->id,
            'label'        => $address->label,
            'street'       => $address->street,
            'city'         => $address->city,
            'full_address' => $address->full_address, // from getFullAddressAttribute()
            'is_default'   => $address->is_default,
        ];
    }

    private function authorizeAddress(Address $address): void
    {
        abort_if($address->user_id !== auth('api')->id(), 403, 'Forbidden.');
    }
}