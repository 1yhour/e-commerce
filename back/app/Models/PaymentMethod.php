<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PaymentMethod extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['provider', 'label', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    // Provider constants
    const PROVIDER_KHQR   = 'KHQR';
    const PROVIDER_STRIPE = 'Stripe';
    const PROVIDER_PAYPAL = 'PayPal';
    const PROVIDER_COD    = 'COD';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | PAYMENT_METHODS ||--o{ PAYMENTS : "used_in"
    */

    /** All payment transactions using this method. */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isKhqr(): bool
    {
        return $this->provider === self::PROVIDER_KHQR;
    }
}