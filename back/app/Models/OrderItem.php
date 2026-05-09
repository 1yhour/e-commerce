<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = ['order_id', 'product_id', 'quantity', 'unit_price'];

    protected $casts = [
        'quantity'   => 'integer',
        'unit_price' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | ORDERS   ||--o{ ORDER_ITEMS : "includes"
    | PRODUCTS ||--o{ ORDER_ITEMS : "purchased_as"
    */

    /** The order this line item belongs to. */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** The product purchased (snapshot price stored separately). */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Line total using the snapshotted unit price (not the live product price). */
    public function getLineTotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }
}