<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasUuids;

    public $timestamps   = false;
    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = ['user_id', 'session_id', 'updated_at'];

    protected $casts = [
        'updated_at' => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function itemsWithProduct(): HasMany
    {
        return $this->hasMany(CartItem::class)->with('product.images');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn ($item) => $item->product->price * $item->quantity);
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Merge a guest cart into the authenticated user's cart after login.
     */
    public static function mergeGuestCart(string $sessionId, string $userId): void
    {
        $guestCart = static::where('session_id', $sessionId)->with('items')->first();
        if (! $guestCart) return;

        $userCart = static::firstOrCreate(
            ['user_id' => $userId],
            ['updated_at' => now()]   // ← was missing updated_at on create
        );

        foreach ($guestCart->items as $guestItem) {
            $existing = CartItem::where('cart_id', $userCart->id)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $guestItem->quantity);
            } else {
                CartItem::create([
                    'cart_id'    => $userCart->id,
                    'product_id' => $guestItem->product_id,
                    'quantity'   => $guestItem->quantity,
                ]);
            }
        }

        $guestCart->delete();
        $userCart->touch('updated_at');
    }
}