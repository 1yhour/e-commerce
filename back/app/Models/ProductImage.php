<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'product_id', 'image_url', 'is_primary', 'sort_order',
    ];

    protected $casts = [
        'is_primary'  => 'boolean',
        'sort_order'  => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | PRODUCTS ||--o{ PRODUCT_IMAGES : "displays"
    */

    /** The product this image belongs to. */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}