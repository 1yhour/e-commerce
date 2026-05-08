<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->foreignUuid('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            
            $table->integer('quantity')->unsigned(); // Must be > 0
            $table->decimal('unit_price', 12, 2);
            
            // Database-level computed column. Automatically calculates quantity * unit_price
            $table->decimal('total_price', 12, 2)->storedAs('quantity * unit_price');
            
            $table->decimal('tax_rate', 5, 2)->nullable();
            $table->jsonb('custom_attributes')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};