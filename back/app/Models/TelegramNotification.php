<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TelegramNotification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_type', 'reference_id', 'chat_id', 'message_text', 
        'status', 'retry_count', 'next_retry_at',
    ];

    protected function casts(): array
    {
        return [
            'retry_count' => 'integer',
            'next_retry_at' => 'datetime',
        ];
    }

    public function logs(): HasMany
    {
        return $this->hasMany(WebhookLog::class, 'notification_id');
    }

    public function failedEntry(): HasOne
    {
        return $this->hasOne(FailedWebhook::class, 'notification_id');
    }

    /**
     * Helper to determine if the notification is ready to be processed by a worker.
     */
    public function isReadyForRetry(): bool
    {
        return $this->status === 'pending' && 
               ($this->next_retry_at === null || $this->next_retry_at->isPast());
    }
}