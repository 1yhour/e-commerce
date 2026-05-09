<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Auth\Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Model implements AuthenticatableContract, JWTSubject
{
    use HasFactory, HasUuids, SoftDeletes, Authenticatable;

    protected $fillable = [
        'role_id',
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'phone',
        'telegram_chat_id',
        'telegram_username',
    ];

    protected $hidden = ['password_hash', 'remember_token'];

    protected $casts = [
        'telegram_chat_id' => 'integer',
        'deleted_at'       => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | JWT Contract Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get the identifier that will be stored in the JWT subject claim.
     * We use the UUID primary key.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key-value array of arbitrary claims to add to the JWT payload.
     * Adding role makes authorization checks possible without a DB round-trip.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role' => optional($this->role)->name,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Authenticatable overrides
    |--------------------------------------------------------------------------
    | Our column is `password_hash` instead of Laravel's default `password`.
    */

    /**
     * Returns the hashed password stored in our custom column name.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | ROLES   ||--o{ USERS     : "assigns"
    | USERS   ||--o{ ADDRESSES : "has"
    | USERS   ||--o{ ORDERS    : "places"
    | USERS   ||--o|  CARTS    : "owns"
    */

    /** The role assigned to this user (Admin / Customer). */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** All saved shipping addresses for this user. */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /** The user's marked default address. */
    public function defaultAddress(): HasOne
    {
        return $this->hasOne(Address::class)->ofMany([], function ($query) {
            $query->where('is_default', true);
        });
    }

    /** All orders placed by this user. */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** The single active shopping cart for this user. */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /** Products saved to this user's wishlist (many-to-many via `wishlists` pivot). */
    public function wishlist(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'wishlists')
                    ->withPivot('created_at')
                    ->orderByPivot('created_at', 'desc');
    }

    /** Telegram notifications dispatched to this admin user. */
    public function telegramNotifications(): HasMany
    {
        return $this->hasMany(TelegramNotification::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Check if this user is an admin. */
    public function isAdmin(): bool
    {
        return optional($this->role)->name === 'Admin';
    }

    /** Check whether this admin has linked their Telegram account. */
    public function hasTelegram(): bool
    {
        return ! is_null($this->telegram_chat_id);
    }
}