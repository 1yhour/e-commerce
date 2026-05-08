<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // 1:1 Relationship with Orders
            $table->foreignUuid('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('provider', 50);
            $table->string('status', 30)->default('pending'); // Enum logic in model
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};