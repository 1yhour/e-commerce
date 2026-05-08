<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingAddress extends Model
{
    use HasFactory, HasUuids;

    // Disables the updated_at timestamp requirement for immutable snapshot
    public const UPDATED_AT = null;

    protected $fillable = [
        'order_id', 'first_name', 'last_name', 'phone', 
        'address_line_1', 'address_line_2', 'city', 
        'state', 'postal_code', 'country',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}