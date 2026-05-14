<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasUuids;

    public $timestamps   = false;
    public $incrementing = false;
    protected $keyType   = 'string';

    protected $fillable = ['cart_id', 'product_id', 'quantity'];

    // ── Relationships ────────────────────────────────────────────────────────

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->with('images');
    }

    // ── Computed ─────────────────────────────────────────────────────────────

    public function getLineTotalAttribute(): float
    {
        return $this->product->price * $this->quantity;
    }
}