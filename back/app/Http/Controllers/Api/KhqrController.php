<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;

class KhqrController extends Controller
{
    public function __construct(private KhqrService $khqrService) {}

    /**
     * Poll the status of a KHQR payment for a specific order.
     * Matches the frontend's PaymentStatus interface.
     */
    public function pollStatus(Order $order): JsonResponse
    {
        $payment = $order->payment;

        if (! $payment || ! $payment->khqrTransaction) {
            return response()->json(['message' => 'No KHQR transaction found for this order.'], 404);
        }

        $khqr = $this->khqrService->pollPaymentStatus($payment->khqrTransaction);

        return response()->json([
            'data' => [
                'order_id'       => $order->id,
                'order_status'   => $order->status,
                'payment_status' => $payment->status,
                'khqr_status'    => $khqr->status,
                'paid_at'        => $khqr->paid_at ? $khqr->paid_at->toIso8601String() : null,
                'expires_at'     => $khqr->expires_at->toIso8601String(),
                'is_expired'     => $khqr->isExpired(),
            ]
        ]);
    }

    /**
     * Regenerate a new KHQR for an existing order.
     * Matches the frontend's KhqrData interface within a data wrapper.
     */
    public function refresh(Order $order): JsonResponse
    {
        $payment = $order->payment;

        if (! $payment) {
            return response()->json(['message' => 'No payment record found for this order.'], 404);
        }

        // Generate a fresh transaction
        $khqr = $this->khqrService->generateForOrder($order, $payment);

        return response()->json([
            'data' => [
                'id'         => $khqr->id,
                'qr_string'  => $khqr->qr_string,
                'md5'        => $khqr->md5,
                'amount'     => $khqr->amount,
                'currency'   => $khqr->currency,
                'expires_at' => $khqr->expires_at->toIso8601String(),
            ]
        ]);
    }

    /**
     * DEV ONLY: Manually force an order's payment to PAID status.
     */
    public function devForcePay(Order $order): JsonResponse
    {
        $payment = $order->payment;

        if (! $payment) {
            return response()->json(['message' => 'No payment record found for this order.'], 404);
        }

        $payment->markPaid(); // Cascade to order processing status

        return response()->json([
            'message' => 'Payment forced to PAID state.',
            'order_status' => $order->refresh()->status,
        ]);
    }
}
