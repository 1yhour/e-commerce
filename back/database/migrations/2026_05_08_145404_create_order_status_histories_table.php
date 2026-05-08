<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            
            $table->string('status', 30);
            $table->text('notes')->nullable();
            
            // Nullable because system events (like auto-cancellation via job) might not have an active user
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Immutable ledger: No updated_at required
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};