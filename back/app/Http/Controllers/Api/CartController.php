<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    // ── GET /api/cart ────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->header('X-Session-Id'));

        if (! $cart) {
            return response()->json(['data' => ['id' => null, 'total_items' => 0, 'subtotal' => 0, 'items' => []]]);
        }

        return response()->json(['data' => $this->cartService->cartToArray($cart)]);
    }

    // ── POST /api/cart/items ─────────────────────────────────────────────────

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity'   => ['sometimes', 'integer', 'min:1', 'max:99'],
        ]);

        $cart = $this->cartService->getOrCreateCart($request->header('X-Session-Id'));
        $item = $this->cartService->addItem($cart, $request->product_id, $request->quantity ?? 1);

        return response()->json([
            'message' => 'Item added to cart.',
            'data'    => $this->cartService->cartToArray($cart->refresh()),
        ], 201);
    }

    // ── PUT /api/cart/items/{cartItem} ───────────────────────────────────────

    public function updateItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorizeCartItem($cartItem, $request);

        $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $this->cartService->updateItem($cartItem, $request->quantity);

        return response()->json([
            'message' => 'Cart updated.',
            'data'    => $this->cartService->cartToArray($cartItem->cart->refresh()),
        ]);
    }

    // ── DELETE /api/cart/items/{cartItem} ────────────────────────────────────

    public function removeItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorizeCartItem($cartItem, $request);

        $cart = $cartItem->cart;
        $this->cartService->removeItem($cartItem);

        return response()->json([
            'message' => 'Item removed.',
            'data'    => $this->cartService->cartToArray($cart->refresh()),
        ]);
    }

    // ── DELETE /api/cart ─────────────────────────────────────────────────────

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->header('X-Session-Id'));

        if ($cart) {
            $this->cartService->clearCart($cart);
        }

        return response()->json(['message' => 'Cart cleared.']);
    }

    // ── Guard: ensure cart item belongs to current cart ──────────────────────

    private function authorizeCartItem(CartItem $item, Request $request): void
    {
        $cart = $this->cartService->getCart($request->header('X-Session-Id'));
        abort_if(! $cart || $item->cart_id !== $cart->id, 403, 'Forbidden.');
    }
}