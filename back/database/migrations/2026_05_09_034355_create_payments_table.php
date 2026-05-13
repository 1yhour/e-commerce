<?php

// database/migrations/2026_05_09_034355_create_payments_table.php
// (Your existing migration — make sure it matches this schema)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->string('order_id', 50);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();

            $table->enum('method', ['khqr', 'cash', 'card'])->default('khqr');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->decimal('amount', 12, 2);

            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};