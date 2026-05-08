<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->string('provider', 50);
            $table->string('event_type', 50);
            
            $table->jsonb('payload');
            $table->jsonb('headers'); // Crucial for debugging signature failures
            
            // Database-level idempotency guarantee
            $table->string('idempotency_key', 255)->unique();
            
            $table->string('processed_status', 20)->default('pending');
            $table->text('error_message')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhooks');
    }
};