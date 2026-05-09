<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = ['name', 'slug'];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | CATEGORIES ||--o{ PRODUCTS : "categorizes"
    */

    /** All products belonging to this category. */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** Only active products in this category. */
    public function activeProducts(): HasMany
    {
        return $this->hasMany(Product::class)->where('is_active', true);
    }
}