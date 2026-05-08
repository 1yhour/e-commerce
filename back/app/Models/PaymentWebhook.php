<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentWebhook extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'provider', 'event_type', 'payload', 'headers', 
        'idempotency_key', 'processed_status', 'error_message',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'headers' => 'array',
        ];
    }

    /**
     * Enforce strict partial immutability on update.
     * Only allow processed_status and error_message to be updated.
     */
    protected static function booted()
    {
        static::updating(function ($webhook) {
            if ($webhook->isDirty(['provider', 'event_type', 'payload', 'headers', 'idempotency_key'])) {
                throw new \LogicException('Core webhook payload data is immutable and cannot be updated after insertion.');
            }
        });
    }
}