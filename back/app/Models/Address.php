<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'label', 'street', 'city', 'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'created_at' => 'datetime',
    ];

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to order by default first.
     */
    public function scopeDefaultFirst($query)
    {
        return $query->orderByDesc('is_default')->orderByDesc('created_at');
    }

    /**
     * Computed full address string.
     */
    public function getFullAddressAttribute(): string
    {
        return "{$this->street}, {$this->city}";
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | USERS     ||--o{ ADDRESSES : "has"
    | ADDRESSES ||--o{ ORDERS    : "shipped_to"
    */

    /** The user who owns this address. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Orders shipped to this address. */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}