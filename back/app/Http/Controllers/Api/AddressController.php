<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    /**
     * GET /api/addresses
     * Returns the authenticated user's saved addresses.
     */
    public function index(): JsonResponse
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->get();

        return response()->json([
            'data' => $addresses
        ]);
    }

    /**
     * POST /api/addresses
     */
    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'label'      => 'required|string|max:50',
            'street'     => 'required|string|max:255',
            'city'       => 'required|string|max:100',
            'country'    => 'required|string|max:100',
            'is_default' => 'boolean',
        ]);

        if ($request->is_default) {
            Address::where('user_id', Auth::id())->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id'    => Auth::id(),
            'label'      => $request->label,
            'street'     => $request->street,
            'city'       => $request->city,
            'country'    => $request->country,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json([
            'message' => 'Address saved.',
            'data'    => $address
        ], 201);
    }
}
