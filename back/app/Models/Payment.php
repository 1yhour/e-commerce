<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasUuids;

    const STATUS_PENDING  = 'pending';
    const STATUS_PAID     = 'paid';
    const STATUS_FAILED   = 'failed';
    const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'order_id', 'method', 'status', 'amount',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function khqrTransaction(): HasOne
    {
        return $this->hasOne(KhqrTransaction::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function markPaid(): void
    {
        $this->update(['status' => self::STATUS_PAID]);
        $this->order->markProcessing();
    }
}