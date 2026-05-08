<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This acts as your Dead-Letter Queue (DLQ)
        Schema::create('failed_webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->foreignUuid('notification_id')->constrained('telegram_notifications')->cascadeOnDelete();
            $table->foreignUuid('webhook_log_id')->nullable()->constrained('webhook_logs')->nullOnDelete();
            
            $table->text('failure_reason');
            $table->boolean('is_resolved')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_webhooks');
    }
};