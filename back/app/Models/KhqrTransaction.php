<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KhqrTransaction extends Model
{
    use HasUuids;

    public $timestamps = false;

    const STATUS_GENERATED = 'generated';
    const STATUS_SCANNED   = 'scanned';
    const STATUS_PAID      = 'paid';
    const STATUS_EXPIRED   = 'expired';
    const STATUS_FAILED    = 'failed';

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
        'created_at',
    ];

    protected $casts = [
        'amount'     => 'float',
        'scanned_at' => 'datetime',
        'paid_at'    => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function markScanned(): void
    {
        if ($this->status === self::STATUS_GENERATED) {
            $this->update(['status' => self::STATUS_SCANNED, 'scanned_at' => now()]);
        }
    }

    public function markPaid(): void
    {
        $this->update(['status' => self::STATUS_PAID, 'paid_at' => now()]);
        $this->payment->markPaid(); // cascade → Payment → Order
    }

    public function markExpired(): void
    {
        $this->update(['status' => self::STATUS_EXPIRED]);
        $this->payment->update(['status' => Payment::STATUS_FAILED]);
    }
}