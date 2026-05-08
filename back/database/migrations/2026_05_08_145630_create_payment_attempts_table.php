<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            
            // Indexed for fast webhook lookup (e.g., matching ABA's tran_id to our attempt)
            $table->string('provider_transaction_id', 100)->nullable()->index();
            
            $table->jsonb('req_payload');
            $table->jsonb('res_payload')->nullable();
            
            $table->string('status', 30)->default('initiated');
            $table->text('error_message')->nullable();
            $table->string('client_ip', 45)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};