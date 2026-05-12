<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'category_id', 'title', 'slug', 'description',
        'price', 'stock_quantity', 'is_active',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active'      => 'boolean',
        'deleted_at'     => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | CATEGORIES ||--o{ PRODUCTS    : "categorizes"
    | PRODUCTS   ||--o{ PRODUCT_IMAGES : "displays"
    | PRODUCTS   ||--o{ REVIEWS     : "receives"
    | PRODUCTS   ||--o{ CART_ITEMS  : "added_to"
    | PRODUCTS   ||--o{ ORDER_ITEMS : "purchased_as"
    */

    /** The category this product belongs to. */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** All images attached to this product. */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /** The single primary/hero image. */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /** Cart items currently referencing this product. */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /** All order line items where this product was purchased. */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Users who have wishlisted this product. */
    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')
                    ->withPivot('created_at');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /** Only active (published) products. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Only products with available stock. */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock_quantity', '>', 0);
    }

    /** Products with stock at or below the given threshold. */
    public function scopeLowStock(Builder $query, int $threshold = 5): Builder
    {
        return $query->where('stock_quantity', '<=', $threshold)
                     ->where('stock_quantity', '>', 0);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    public function getImageAttribute()
    {
        return $this->primaryImage?->image_url;
    }
}