<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->string('type', 20); // Enum mapped in Model
            $table->integer('quantity'); // Signed integer allows negative numbers
            $table->uuid('reference_id')->nullable()->index(); // Polymorphic-like ID
            $table->text('notes')->nullable();
            
            // Append-only ledger: We only need created_at, heavily indexed for fast sums
            $table->timestamp('created_at')->useCurrent();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};