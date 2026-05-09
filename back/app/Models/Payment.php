<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'order_id', 'payment_method_id', 'transaction_id',
        'status', 'amount', 'currency', 'paid_at', 'expires_at',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'paid_at'    => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED  = 'failed';
    const STATUS_EXPIRED = 'expired';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | ORDERS          ||--|| PAYMENTS         : "processed_via"
    | PAYMENT_METHODS ||--o{ PAYMENTS         : "used_in"
    | PAYMENTS        ||--o| KHQR_TRANSACTIONS : "details"
    */

    /** The order this payment is for. */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** The payment method used (KHQR / Stripe / PayPal / COD). */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * The KHQR-specific transaction details.
     * Only exists when paymentMethod.provider === 'KHQR'.
     */
    public function khqrTransaction(): HasOne
    {
        return $this->hasOne(KhqrTransaction::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isSuccess(): bool
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED
            || ($this->expires_at && $this->expires_at->isPast() && $this->isPending());
    }
}