<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    // String primary key e.g. 'ORD-2026-A1B2C3'
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = [
        'id', 'user_id', 'address_id', 'status',
        'subtotal', 'tax_amount', 'shipping_fee', 'total_amount', 'note',
    ];

    protected $casts = [
        'subtotal'     => 'decimal:2',
        'tax_amount'   => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Order status constants (mirrors DB enum)
    const STATUS_PENDING    = 'Pending Payment';
    const STATUS_PROCESSING = 'Processing';
    const STATUS_SHIPPED    = 'Shipped';
    const STATUS_COMPLETED  = 'Completed';
    const STATUS_CANCELLED  = 'Cancelled';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | USERS     ||--o{ ORDERS      : "places"
    | ADDRESSES ||--o{ ORDERS      : "shipped_to"
    | ORDERS    ||--o{ ORDER_ITEMS : "includes"
    | ORDERS    ||--|| PAYMENTS    : "processed_via"
    */

    /** The customer who placed this order. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The shipping address for this order. */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    /** All line items in this order. */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** The payment record for this order (one-to-one). */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isPaid(): bool
    {
        return optional($this->payment)->status === Payment::STATUS_SUCCESS;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}