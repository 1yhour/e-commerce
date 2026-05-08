<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReservation extends Model
{
    use HasFactory, HasUuids;

    // Disables the updated_at timestamp requirement
    public const UPDATED_AT = null;

    protected $fillable = [
        'cart_id', 'product_variant_id', 'quantity', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
    
    /**
     * Check if the reservation is still valid.
     */
    public function isValid(): bool
    {
        return $this->expires_at->isFuture();
    }
}