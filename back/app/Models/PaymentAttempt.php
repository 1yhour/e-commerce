<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttempt extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'payment_id', 'provider_transaction_id', 'req_payload', 
        'res_payload', 'status', 'error_message', 'client_ip',
    ];

    protected function casts(): array
    {
        return [
            'req_payload' => 'array',
            'res_payload' => 'array',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}