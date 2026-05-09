<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Telegram Bot Notifications
     * ─────────────────────────
     * When a new order is placed or a payment status changes, the system fires
     * a Telegram message to all admin users who have linked their chat_id
     * (stored in users.telegram_chat_id). This table is an audit log of every
     * notification dispatched, so admins can replay or debug missed alerts.
     */
    public function up(): void
    {
        Schema::create('telegram_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            // Which admin received this notification
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->bigInteger('chat_id');   // Denormalised from users.telegram_chat_id

            // What triggered this notification
            $table->enum('event_type', [
                'new_order',          // Customer placed an order
                'payment_success',    // Payment confirmed
                'payment_failed',     // Payment failed/expired
                'order_shipped',      // Order status changed to Shipped
                'low_stock',          // Product stock below threshold
            ]);

            // Polymorphic-style reference to the triggering entity
            $table->string('reference_type', 50);   // 'order', 'payment', 'product'
            $table->string('reference_id', 100);    // order_id / payment UUID / product UUID

            $table->text('message');                // Full message text sent to Telegram
            $table->integer('telegram_message_id')->nullable(); // Returned by Telegram API

            $table->enum('delivery_status', ['sent', 'failed'])->default('sent');
            $table->text('error_message')->nullable(); // If delivery_status = failed

            $table->timestampTz('sent_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telegram_notifications');
    }
};