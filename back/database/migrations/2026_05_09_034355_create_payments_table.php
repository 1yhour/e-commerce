<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            // One order → one payment record
            $table->string('order_id', 50)->unique();
            $table->foreign('order_id')->references('id')->on('orders');

            // Which payment method was chosen (KHQR / Stripe / PayPal / COD)
            $table->foreignUuid('payment_method_id')->constrained('payment_methods');

            // External transaction reference from the provider (null until confirmed)
            $table->string('transaction_id', 255)->nullable();

            $table->enum('status', ['pending', 'success', 'failed', 'expired'])
                  ->default('pending');

            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('USD'); // USD or KHR

            $table->timestampTz('paid_at')->nullable();    // Set when status → success
            $table->timestampTz('expires_at')->nullable(); // Payment window deadline
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};