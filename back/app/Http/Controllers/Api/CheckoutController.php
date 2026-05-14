<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\CartService;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private KhqrService $khqrService
    ) {}

    /**
     * Handle the checkout process: Convert cart to order and generate payment.
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'address_id' => ['required', 'uuid', 'exists:addresses,id'],
            'note'       => ['nullable', 'string', 'max:500'],
        ]);

        $cart = $this->cartService->getCart($request->header('X-Session-Id'));

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty or not found.'], 400);
        }

        try {
            return DB::transaction(function () use ($request, $cart) {
                $cartData = $this->cartService->cartToArray($cart);

                // 1. Create Order
                $order = Order::create([
                    'user_id'      => auth('api')->id(),
                    'address_id'   => $request->address_id,
                    'status'       => Order::STATUS_PENDING,
                    'subtotal'     => $cartData['subtotal'],
                    'tax_amount'   => 0,
                    'shipping_fee' => 0,
                    'total_amount' => $cartData['subtotal'],
                    'note'         => $request->note,
                ]);

                // 2. Create Order Items
                foreach ($cart->items as $item) {
                    OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => $item->product_id,
                        'quantity'   => $item->quantity,
                        'unit_price' => $item->product->price,
                    ]);
                }

                // 3. Create Payment record (Use lowercase 'khqr' to match DB enum)
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'method'   => 'khqr',
                    'status'   => Payment::STATUS_PENDING,
                    'amount'   => $order->total_amount,
                ]);

                // 4. Generate KHQR
                $khqr = $this->khqrService->generateForOrder($order, $payment);

                // 5. Clear Cart
                $this->cartService->clearCart($cart);

                // Return response matching the frontend's CheckoutResponse interface
                return response()->json([
                    'message' => 'Order placed successfully.',
                    'data'    => [
                        'order_id' => $order->id,
                        'total'    => $order->total_amount,
                        'payment'  => [
                            'id'     => $payment->id,
                            'method' => $payment->method,
                            'status' => $payment->status,
                        ],
                        'khqr'     => [
                            'id'         => $khqr->id,
                            'qr_string'  => $khqr->qr_string,
                            'md5'        => $khqr->md5,
                            'amount'     => $khqr->amount,
                            'currency'   => $khqr->currency,
                            'expires_at' => $khqr->expires_at->toIso8601String(),
                        ],
                    ],
                ], 201);
            });
        } catch (\Exception $e) {
            \Log::error('Checkout failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Failed to process checkout.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List current user's orders.
     */
    public function index(): JsonResponse
    {
        $orders = Order::where('user_id', auth('api')->id())
            ->with(['items.product.images', 'address'])
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Show a specific order.
     */
    public function show(Order $order): JsonResponse
    {
        abort_if($order->user_id !== auth('api')->id(), 403, 'Forbidden.');

        return response()->json([
            'data' => $order->load(['items.product.images', 'address', 'payment.khqrTransaction'])
        ]);
    }
}
