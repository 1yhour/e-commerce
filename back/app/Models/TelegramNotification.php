<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramNotification extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'telegram_notifications';

    protected $fillable = [
        'user_id',
        'chat_id',
        'event_type',
        'reference_type',
        'reference_id',
        'message',
        'telegram_message_id',
        'delivery_status',
        'error_message',
    ];

    protected $casts = [
        'chat_id'            => 'integer',
        'telegram_message_id'=> 'integer',
        'sent_at'            => 'datetime',
    ];

    // Event type constants
    const EVENT_NEW_ORDER       = 'new_order';
    const EVENT_PAYMENT_SUCCESS = 'payment_success';
    const EVENT_PAYMENT_FAILED  = 'payment_failed';
    const EVENT_ORDER_SHIPPED   = 'order_shipped';
    const EVENT_LOW_STOCK       = 'low_stock';

    // Delivery status
    const DELIVERY_SENT   = 'sent';
    const DELIVERY_FAILED = 'failed';

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | USERS ||--o{ TELEGRAM_NOTIFICATIONS : "receives"
    */

    /** The admin user this notification was sent to. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Resolve the referenced entity (Order, Payment, or Product). */
    public function resolveReference(): Model|null
    {
        return match ($this->reference_type) {
            'order'   => Order::find($this->reference_id),
            'payment' => Payment::find($this->reference_id),
            'product' => Product::find($this->reference_id),
            default   => null,
        };
    }

    public function wasDelivered(): bool
    {
        return $this->delivery_status === self::DELIVERY_SENT;
    }
}