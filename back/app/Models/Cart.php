<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasUuids;

    /**
     * Disable standard timestamps because the migration only has updated_at.
     * We handle updated_at manually or via $cart->touch().
     */
    public $timestamps = false;
    
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'session_id',
        'updated_at'
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function itemsWithProduct(): HasMany
    {
        return $this->hasMany(CartItem::class)->with('product.images');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}