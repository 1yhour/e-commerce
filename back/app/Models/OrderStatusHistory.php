<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_status_history'; // Explicitly define table name for clarity

    // Disables the updated_at timestamp requirement for immutable ledger
    public const UPDATED_AT = null;

    protected $fillable = [
        'order_id', 'status', 'notes', 'created_by',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}