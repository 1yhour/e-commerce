<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FailedWebhook extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'notification_id', 'webhook_log_id', 'failure_reason', 'is_resolved',
    ];

    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
        ];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(TelegramNotification::class, 'notification_id');
    }

    public function log(): BelongsTo
    {
        return $this->belongsTo(WebhookLog::class, 'webhook_log_id');
    }
}