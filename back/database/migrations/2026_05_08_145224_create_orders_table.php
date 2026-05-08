<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number', 20)->unique(); // E.g., ORD-20260508-A9F2
            
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            // Cart ID is traceable but doesn't necessarily need a strict FK constraint if carts are purged, 
            // but we'll add it as nullable to keep referential integrity if carts are kept.
            $table->foreignUuid('cart_id')->nullable()->constrained('carts')->nullOnDelete();
            
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_fee', 12, 2);
            $table->decimal('tax_total', 12, 2);
            $table->decimal('discount_total', 12, 2);
            $table->decimal('grand_total', 12, 2);
            $table->string('currency', 3)->default('USD');
            
            $table->string('status', 30); // Enum logic in model
            $table->text('customer_notes')->nullable();
            
            $table->timestamps();
            
            $table->index('order_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};