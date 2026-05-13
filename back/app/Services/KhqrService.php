<?php

namespace App\Services;

use App\Models\KhqrTransaction;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KhqrService
{
    // ── Config ───────────────────────────────────────────────────────────────

    private string $bakongAccountId;
    private string $merchantName;
    private string $merchantCity;
    private string $bakongApiToken;
    private string $bakongApiBase;
    private int    $qrTtlMinutes;
    private bool   $mockMode;
    private int    $mockAutoPaySeconds;

    public function __construct()
    {
        $this->bakongAccountId    = config('khqr.bakong_account_id', 'dev_mock@devb');
        $this->merchantName       = config('khqr.merchant_name', 'DEV STORE');
        $this->merchantCity       = config('khqr.merchant_city', 'Phnom Penh');
        $this->bakongApiToken     = config('khqr.api_token', '');
        $this->bakongApiBase      = config('khqr.api_base', 'https://api-bakong.nbc.org.kh');
        $this->qrTtlMinutes       = (int) config('khqr.qr_ttl_minutes', 10);
        $this->mockMode           = (bool) config('khqr.mock_mode', false);
        $this->mockAutoPaySeconds = (int) config('khqr.mock_auto_pay_seconds', 15);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Generate a Dynamic KHQR for an order and persist a KhqrTransaction record.
     */
    public function generateForOrder(Order $order, Payment $payment): KhqrTransaction
    {
        $qrString = $this->buildQrString(
            amount:    $order->total_amount,
            currency:  'USD',
            orderId:   $order->id,
        );

        $md5 = md5($qrString);

        return KhqrTransaction::create([
            'payment_id'        => $payment->id,
            'bakong_account_id' => $this->bakongAccountId,
            'merchant_name'     => $this->merchantName,
            'merchant_city'     => $this->merchantCity,
            'qr_string'         => $qrString,
            'md5'               => $md5,
            'amount'            => $order->total_amount,
            'currency'          => 'USD',
            'status'            => KhqrTransaction::STATUS_GENERATED,
            'expires_at'        => now()->addMinutes($this->qrTtlMinutes),
            'created_at'        => now(),
        ]);
    }

    /**
     * Poll payment status.
     * In mock mode: auto-confirms after BAKONG_MOCK_AUTO_PAY_SECONDS (no HTTP call).
     * In production: calls the real Bakong API.
     */
    public function pollPaymentStatus(KhqrTransaction $khqr): KhqrTransaction
    {
        // Already in a terminal state — nothing to do
        if ($khqr->status === KhqrTransaction::STATUS_PAID) {
            return $khqr;
        }

        // Handle expiry first (applies in both modes)
        if ($khqr->isExpired() && $khqr->status !== KhqrTransaction::STATUS_PAID) {
            $khqr->markExpired();
            return $khqr->refresh();
        }

        return $this->mockMode
            ? $this->mockPoll($khqr)
            : $this->livePoll($khqr);
    }

    // ── Mock polling ─────────────────────────────────────────────────────────

    /**
     * Simulates Bakong payment confirmation after a fixed delay.
     *
     * Timeline (with default BAKONG_MOCK_AUTO_PAY_SECONDS=15):
     *   0–5 s  → status: generated  (QR just shown)
     *   5–15 s → status: scanned    (simulate customer opened app)
     *   15s+   → status: paid       (auto-confirmed, order → Processing)
     */
    private function mockPoll(KhqrTransaction $khqr): KhqrTransaction
    {
        $age = now()->diffInSeconds($khqr->created_at);

        Log::debug('[KHQR MOCK] Polling', [
            'order'      => $khqr->payment->order_id,
            'age_seconds'=> $age,
            'auto_pay_at'=> $this->mockAutoPaySeconds,
            'status'     => $khqr->status,
        ]);

        if ($age >= $this->mockAutoPaySeconds) {
            $khqr->markScanned();
            $khqr->markPaid(); // → Payment::markPaid() → Order::markProcessing()

        } elseif ($age >= ($this->mockAutoPaySeconds / 3) &&
                  $khqr->status === KhqrTransaction::STATUS_GENERATED) {
            $khqr->markScanned(); // Simulate customer scanning mid-way
        }

        return $khqr->refresh();
    }

    // ── Live Bakong API polling ───────────────────────────────────────────────

    /**
     * Calls the real Bakong check_transaction_by_md5 endpoint.
     *
     * Response codes:
     *   0  → paid
     *   6  → not found yet (still waiting)
     *   11 → QR expired on Bakong side
     */
    private function livePoll(KhqrTransaction $khqr): KhqrTransaction
    {
        try {
            $response = Http::withToken($this->bakongApiToken)
                ->timeout(8)
                ->post("{$this->bakongApiBase}/v1/check_transaction_by_md5", [
                    'md5' => $khqr->md5,
                ]);

            if (! $response->successful()) {
                Log::warning('[KHQR] Poll HTTP error', [
                    'http_status' => $response->status(),
                    'md5'         => $khqr->md5,
                ]);
                return $khqr;
            }

            $code = $response->json('responseCode', -1);

            if ($code === 0) {
                $khqr->markScanned();
                $khqr->markPaid();
            } elseif ($code === 11) {
                $khqr->markExpired();
            }
            // code 6 → still pending, no action

        } catch (\Throwable $e) {
            Log::error('[KHQR] Poll exception', [
                'error' => $e->getMessage(),
                'md5'   => $khqr->md5,
            ]);
        }

        return $khqr->refresh();
    }

    // ── EMV QR String Builder ────────────────────────────────────────────────

    /**
     * Builds a KHQR-compliant EMV QR string (Dynamic, Individual Bakong account).
     *
     * Spec reference: NBC KHQR Specification v1.0
     */
    private function buildQrString(float $amount, string $currency, string $orderId): string
    {
        $currencyCode = $currency === 'KHR' ? '116' : '840';
        $amountStr    = number_format($amount, 2, '.', '');

        // Tag 29: Merchant Account Information (Bakong Individual)
        $merchantAccountInfo = $this->tlv('00', 'bakong.nbc@nbcqr')
            . $this->tlv('01', $this->bakongAccountId);

        // Tag 62: Additional Data Field — sub-tag 05 = Reference Label (order ID)
        $additionalData = $this->tlv('05', substr($orderId, 0, 25));

        // Assemble QR payload (without CRC)
        $payload  = $this->tlv('00', '01');                                  // Payload format indicator
        $payload .= $this->tlv('01', '12');                                  // Dynamic QR
        $payload .= $this->tlv('29', $merchantAccountInfo);                  // Merchant account
        $payload .= $this->tlv('52', '5999');                                // MCC (general retail)
        $payload .= $this->tlv('53', $currencyCode);                         // Currency
        $payload .= $this->tlv('54', $amountStr);                            // Amount
        $payload .= $this->tlv('58', 'KH');                                  // Country code
        $payload .= $this->tlv('59', substr($this->merchantName, 0, 25));    // Merchant name
        $payload .= $this->tlv('60', substr($this->merchantCity, 0, 15));    // Merchant city
        $payload .= $this->tlv('62', $additionalData);                       // Additional data
        $payload .= '6304';                                                  // CRC tag (value appended below)

        return $payload . $this->crc16($payload);
    }

    /**
     * EMV TLV encoder: Tag + zero-padded 2-digit Length + Value
     */
    private function tlv(string $tag, string $value): string
    {
        return $tag . str_pad(strlen($value), 2, '0', STR_PAD_LEFT) . $value;
    }

    /**
     * CRC-16/CCITT-FALSE (used by EMVCo QR spec)
     */
    private function crc16(string $data): string
    {
        $crc = 0xFFFF;

        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= ord($data[$i]) << 8;
            for ($j = 0; $j < 8; $j++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
