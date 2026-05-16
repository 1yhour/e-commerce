<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\CartService;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService  $cartService,
        private KhqrService  $khqrService,
    ) {}

    /**
     * POST /api/checkout
     *
     * 1. Validates the cart is non-empty
     * 2. Creates Order + OrderItems (snapshot prices)
     * 3. Creates Payment record
     * 4. Generates KHQR and returns QR string + polling token
     * 5. Clears the cart
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'address_id'     => ['required', 'uuid', 'exists:addresses,id'],
            'note'           => ['nullable', 'string', 'max:500'],
            'payment_method' => ['required', 'in:khqr'],  // extend when adding more methods
        ]);

        // ── Resolve cart ─────────────────────────────────────────────────────
        $cart = $this->cartService->getCart($request->header('X-Session-Id'));
        abort_if(! $cart || $cart->items()->count() === 0, 422, 'Your cart is empty.');

        $items = $cart->itemsWithProduct()->get();

        // ── Validate all products still exist + calculate totals ─────────────
        foreach ($items as $item) {
            abort_if(! $item->product, 422, "Product {$item->product_id} is no longer available.");
        }

        $subtotal     = $items->sum(fn ($i) => $i->product->price * $i->quantity);
        $taxRate      = 0.10; // 10% VAT — adjust as needed
        $taxAmount    = round($subtotal * $taxRate, 2);
        $shippingFee  = $this->calculateShipping($subtotal);
        $totalAmount  = round($subtotal + $taxAmount + $shippingFee, 2);

        // ── Wrap everything in a DB transaction ──────────────────────────────
        $result = DB::transaction(function () use ($request, $items, $subtotal, $taxAmount, $shippingFee, $totalAmount) {

            // 1. Create Order
            $order = Order::create([
                'user_id'      => Auth::id(),
                'address_id'   => $request->address_id,
                'status'       => Order::STATUS_PENDING,
                'subtotal'     => $subtotal,
                'tax_amount'   => $taxAmount,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'note'         => $request->note,
            ]);

            // 2. Snapshot order items (price locked at time of purchase)
            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity'   => $item->quantity,
                    'unit_price' => $item->product->price,
                ]);
            }

            // 3. Create Payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'method'   => 'khqr',
                'status'   => Payment::STATUS_PENDING,
                'amount'   => $totalAmount,
            ]);

            // 4. Generate KHQR
            $khqr = $this->khqrService->generateForOrder($order, $payment);

            return compact('order', 'payment', 'khqr');
        });

        // 5. Clear cart AFTER successful transaction
        $this->cartService->clearCart($cart);

        return response()->json([
            'message' => 'Order created. Please complete payment.',
            'data'    => [
                'order_id'    => $result['order']->id,
                'total'       => $totalAmount,
                'payment'     => [
                    'id'         => $result['payment']->id,
                    'method'     => 'khqr',
                    'status'     => $result['payment']->status,
                ],
                'khqr'        => [
                    'id'         => $result['khqr']->id,
                    'qr_string'  => $result['khqr']->qr_string,
                    'md5'        => $result['khqr']->md5,
                    'amount'     => $result['khqr']->amount,
                    'currency'   => $result['khqr']->currency,
                    'expires_at' => $result['khqr']->expires_at->toISOString(),
                ],
            ],
        ], 201);
    }

    /**
     * GET /api/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        abort_if($order->user_id !== Auth::id(), 403, 'Forbidden.');

        return response()->json([
            'data' => [
                'id'           => $order->id,
                'status'       => $order->status,
                'subtotal'     => $order->subtotal,
                'tax_amount'   => $order->tax_amount,
                'shipping_fee' => $order->shipping_fee,
                'total_amount' => $order->total_amount,
                'note'         => $order->note,
                'created_at'   => $order->created_at,
                'items'        => $order->items->map(fn ($i) => [
                    'product_name' => $i->product?->name,
                    'quantity'     => $i->quantity,
                    'unit_price'   => $i->unit_price,
                    'line_total'   => $i->line_total,
                ]),
                'payment'      => $order->payment ? [
                    'status' => $order->payment->status,
                    'method' => $order->payment->method,
                ] : null,
            ],
        ]);
    }

    /**
     * GET /api/orders — authenticated user's order history
     */
    public function index(): JsonResponse
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('payment')
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function calculateShipping(float $subtotal): float
    {
        // Free shipping over $50; otherwise $3 flat
        return $subtotal >= 50 ? 0.00 : 3.00;
    }
}
