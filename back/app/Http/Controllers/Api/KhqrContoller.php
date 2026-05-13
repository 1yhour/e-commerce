<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KhqrTransaction;
use App\Models\Order;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KhqrController extends Controller
{
    public function __construct(private KhqrService $khqrService) {}

    /**
     * GET /api/orders/{order}/payment/status
     *
     * Frontend polls this every 3–5 seconds while QR is displayed.
     * Returns current payment status + order status.
     */
    public function pollStatus(Order $order): JsonResponse
    {
        abort_if($order->user_id !== Auth::id(), 403, 'Forbidden.');

        $payment = $order->payment;
        abort_if(! $payment, 404, 'No payment found for this order.');

        $khqr = $payment->khqrTransaction;
        abort_if(! $khqr, 404, 'No KHQR transaction found.');

        // Only call Bakong API if still in a pending/scanned state
        if (in_array($khqr->status, [KhqrTransaction::STATUS_GENERATED, KhqrTransaction::STATUS_SCANNED])) {
            $khqr = $this->khqrService->pollPaymentStatus($khqr);
        }

        return response()->json([
            'data' => [
                'order_id'       => $order->id,
                'order_status'   => $order->fresh()->status,
                'payment_status' => $payment->fresh()->status,
                'khqr_status'    => $khqr->status,
                'paid_at'        => $khqr->paid_at?->toISOString(),
                'expires_at'     => $khqr->expires_at->toISOString(),
                'is_expired'     => $khqr->isExpired(),
            ],
        ]);
    }

    /**
     * POST /api/dev/orders/{order}/force-pay   ← LOCAL ENV ONLY
     *
     * Instantly marks a KHQR transaction as paid without waiting for the
     * mock timer. Useful when you want to test the success flow immediately.
     *
     * Remove (or the route) before deploying to production.
     */
    public function devForcePay(Order $order): JsonResponse
    {
        abort_unless(app()->environment('local', 'development'), 404);
        abort_if($order->user_id !== Auth::id(), 403, 'Forbidden.');

        $khqr = $order->payment?->khqrTransaction;
        abort_if(! $khqr, 404, 'No KHQR transaction found.');
        abort_if($khqr->status === KhqrTransaction::STATUS_PAID, 422, 'Already paid.');

        $khqr->markScanned();
        $khqr->markPaid();

        return response()->json([
            'message'      => '[DEV] Payment force-confirmed.',
            'order_status' => $order->fresh()->status,
            'khqr_status'  => $khqr->fresh()->status,
        ]);
    }

    public function refresh(Order $order): JsonResponse
    {
        abort_if($order->user_id !== Auth::id(), 403, 'Forbidden.');
        abort_if($order->isPaid(), 422, 'Order is already paid.');

        $payment = $order->payment;
        abort_if(! $payment, 404, 'No payment found.');

        $oldKhqr = $payment->khqrTransaction;
        abort_if($oldKhqr && ! $oldKhqr->isExpired(), 422, 'Current QR has not expired yet.');

        // Soft-delete old KHQR record if you want audit trail,
        // or just create a new one (old unique constraint on payment_id needs handling).
        // For simplicity: update the existing record.
        $newQrString = $this->khqrService->generateForOrder($order, $payment);

        // Replace old KHQR
        if ($oldKhqr) {
            $oldKhqr->delete();
        }

        $khqr = $this->khqrService->generateForOrder($order, $payment);

        return response()->json([
            'message' => 'New QR generated.',
            'data'    => [
                'qr_string'  => $khqr->qr_string,
                'md5'        => $khqr->md5,
                'expires_at' => $khqr->expires_at->toISOString(),
            ],
        ]);
    }
}