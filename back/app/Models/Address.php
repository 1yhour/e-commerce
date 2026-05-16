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
        'user_id', 'street', 'city', 'country', 'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'created_at' => 'datetime',
    ];

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