<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// ============================================================
// Cart
// ============================================================
class Cart extends Model
{
    use HasUuids;

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = ['user_id', 'session_id'];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | USERS ||--o| CARTS      : "owns"
    | CARTS ||--o{ CART_ITEMS : "contains"
    */

    /** The user who owns this cart (null for guest carts). */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** All items currently in this cart. */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Calculate total price of all cart items. */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn ($item) => $item->quantity * $item->product->price);
    }

    /** Total item count across all cart lines. */
    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }
}