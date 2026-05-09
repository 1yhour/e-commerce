<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KhqrTransaction extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'khqr_transactions';

    protected $fillable = [
        'payment_id',
        'bakong_account_id',
        'merchant_name',
        'merchant_city',
        'qr_string',
        'qr_image_url',
        'md5',
        'amount',
        'currency',
        'status',
        'scanned_at',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'scanned_at' => 'datetime',
        'paid_at'    => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    // KHQR lifecycle statuses
    const STATUS_GENERATED = 'generated'; // QR created, waiting for scan
    const STATUS_SCANNED   = 'scanned';   // Customer opened/scanned the QR
    const STATUS_PAID      = 'paid';      // Bakong API confirmed payment
    const STATUS_EXPIRED   = 'expired';   // QR window passed
    const STATUS_FAILED    = 'failed';    // Payment rejected

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | PAYMENTS ||--o| KHQR_TRANSACTIONS : "details"
    */

    /**
     * The parent payment record.
     * Use this to access the order: $khqr->payment->order
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Whether the QR code window is past its expiry. */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /** Whether Bakong has confirmed this payment. */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Shortcut to the order via the payment relationship.
     * Usage: $khqr->order->id
     */
    public function getOrderAttribute(): Order
    {
        return $this->payment->order;
    }

    /**
     * Build the Bakong API polling URL for this transaction.
     * Your service layer should call this endpoint to check payment status.
     */
    public function getBakongCheckUrlAttribute(): string
    {
        return "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5/{$this->md5}";
    }
}