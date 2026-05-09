<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['cart_id', 'product_id', 'quantity'];

    protected $casts = ['quantity' => 'integer'];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | CARTS    ||--o{ CART_ITEMS : "contains"
    | PRODUCTS ||--o{ CART_ITEMS : "added_to"
    */

    /** The cart this item belongs to. */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /** The product added to the cart. */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Line total = quantity × current product price. */
    public function getLineTotalAttribute(): float
    {
        return $this->quantity * $this->product->price;
    }
}