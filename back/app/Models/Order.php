<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = [
        'id', 'user_id', 'address_id', 'status',
        'subtotal', 'tax_amount', 'shipping_fee', 'total_amount', 'note',
    ];

    protected $casts = [
        'subtotal'      => 'float',
        'tax_amount'    => 'float',
        'shipping_fee'  => 'float',
        'total_amount'  => 'float',
    ];

    // ── Order status constants ────────────────────────────────────────────────

    const STATUS_PENDING    = 'Pending Payment';
    const STATUS_PROCESSING = 'Processing';
    const STATUS_SHIPPED    = 'Shipped';
    const STATUS_COMPLETED  = 'Completed';
    const STATUS_CANCELLED  = 'Cancelled';

    // ── Boot: auto-generate order ID ─────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Order $order) {
            if (empty($order->id)) {
                $order->id = static::generateId();
            }
        });
    }

    public static function generateId(): string
    {
        do {
            $id = 'ORD-' . now()->year . '-' . strtoupper(Str::random(6));
        } while (static::where('id', $id)->exists());

        return $id;
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->with('product.images');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isPaid(): bool
    {
        return $this->payment && $this->payment->status === Payment::STATUS_PAID;
    }

    public function markProcessing(): void
    {
        $this->update(['status' => self::STATUS_PROCESSING]);
    }
}