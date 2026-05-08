<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookLog extends Model
{
    use HasFactory, HasUuids;

    // Enforce immutable ledger concept
    public const UPDATED_AT = null;

    protected $fillable = [
        'notification_id', 'endpoint_url', 'req_payload', 
        'res_status_code', 'res_payload', 'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'req_payload' => 'array',
            'res_payload' => 'array',
            'res_status_code' => 'integer',
            'duration_ms' => 'integer',
        ];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(TelegramNotification::class, 'notification_id');
    }
}