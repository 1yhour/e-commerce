<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartService
{
    /**
     * Resolve the current cart:
     *  - Authenticated → user-tied cart
     *  - Guest         → session-tied cart
     */
    public function getOrCreateCart(?string $sessionId = null): Cart
    {
        if (Auth::check()) {
            return Cart::firstOrCreate(
                ['user_id' => Auth::id()],
                ['updated_at' => now()]
            );
        }

        // Guest cart
        abort_if(! $sessionId, 400, 'Session ID required for guest cart.');

        return Cart::firstOrCreate(
            ['session_id' => $sessionId],
            ['updated_at' => now()]
        );
    }

    public function getCart(?string $sessionId = null): ?Cart
    {
        if (Auth::check()) {
            return Cart::where('user_id', Auth::id())->with('itemsWithProduct')->first();
        }

        if ($sessionId) {
            return Cart::where('session_id', $sessionId)->with('itemsWithProduct')->first();
        }

        return null;
    }

    public function addItem(Cart $cart, string $productId, int $quantity = 1): CartItem
    {
        $product = Product::findOrFail($productId);

        // Validate stock if your products table has a stock column
        // abort_if($product->stock < $quantity, 422, 'Insufficient stock.');

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();

        if ($item) {
            $item->increment('quantity', $quantity);
            $item->refresh();
        } else {
            $item = CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $productId,
                'quantity'   => $quantity,
            ]);
        }

        $cart->touch('updated_at');

        return $item->load('product.images');
    }

    public function updateItem(CartItem $item, int $quantity): CartItem
    {
        abort_if($quantity < 1, 422, 'Quantity must be at least 1.');
        $item->update(['quantity' => $quantity]);
        $item->cart->touch('updated_at');
        return $item->load('product.images');
    }

    public function removeItem(CartItem $item): void
    {
        $cart = $item->cart;
        $item->delete();
        $cart->touch('updated_at');
    }

    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->touch('updated_at');
    }

    public function cartToArray(Cart $cart): array
    {
        $items = $cart->itemsWithProduct()->get();

        $subtotal = $items->sum(fn ($i) => $i->product->price * $i->quantity);

        return [
            'id'          => $cart->id,
            'total_items' => $items->sum('quantity'),
            'subtotal'    => round($subtotal, 2),
            'items'       => $items->map(fn ($i) => [
                'id'         => $i->id,
                'quantity'   => $i->quantity,
                'line_total' => round($i->product->price * $i->quantity, 2),
                'product'    => [
                    'id'     => $i->product->id,
                    'name'   => $i->product->name,
                    'price'  => $i->product->price,
                    'image'  => $i->product->images->first()?->image_url,
                ],
            ])->values(),
        ];
    }
}
