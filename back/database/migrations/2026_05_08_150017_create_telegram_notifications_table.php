<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telegram_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->string('event_type', 50); // E.g., 'order.paid'
            // Polymorphic-like ID to link back to the triggering entity (Order, Product, etc.)
            $table->uuid('reference_id')->nullable()->index(); 
            
            $table->string('chat_id', 50);
            $table->text('message_text');
            
            $table->string('status', 20)->default('pending'); 
            $table->integer('retry_count')->default(0);
            
            // Indexed for fast polling by Laravel's schedule/queue workers
            $table->timestamp('next_retry_at')->nullable()->index();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telegram_notifications');
    }
};