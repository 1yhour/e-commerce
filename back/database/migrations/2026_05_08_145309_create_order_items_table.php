<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            
            // Null on delete ensures if a product is deleted, the order receipt still works
            $table->foreignUuid('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            
            // Hard snapshots
            $table->string('product_name', 255);
            $table->string('sku', 100);
            $table->decimal('unit_price', 12, 2);
            $table->integer('quantity');
            
            // Database-computed column for total price
            $table->decimal('total_price', 12, 2)->storedAs('quantity * unit_price');
            
            // Immutable snapshot: No updated_at required
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};