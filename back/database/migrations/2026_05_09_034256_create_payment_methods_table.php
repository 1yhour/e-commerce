<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            // Supported providers: KHQR, Stripe, PayPal, COD (Cash on Delivery)
            $table->enum('provider', ['KHQR', 'Stripe', 'PayPal', 'COD'])->unique();
            $table->string('label', 100);           // Human-readable: "KHQR (Bakong)"
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
        });

        // Seed default payment methods
        DB::table('payment_methods')->insert([
            ['provider' => 'KHQR',   'label' => 'KHQR (Bakong)',    'is_active' => true,  'sort_order' => 1],
            ['provider' => 'Stripe', 'label' => 'Credit/Debit Card','is_active' => true,  'sort_order' => 2],
            ['provider' => 'PayPal', 'label' => 'PayPal',           'is_active' => true,  'sort_order' => 3],
            ['provider' => 'COD',    'label' => 'Cash on Delivery',  'is_active' => true,  'sort_order' => 4],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};