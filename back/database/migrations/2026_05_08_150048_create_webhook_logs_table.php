<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('notification_id')->constrained('telegram_notifications')->cascadeOnDelete();
            
            $table->string('endpoint_url', 255);
            $table->jsonb('req_payload'); 
            
            $table->integer('res_status_code')->nullable();
            $table->jsonb('res_payload')->nullable();
            
            $table->integer('duration_ms')->nullable();
            
            // Immutable log: Only created_at is needed
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};