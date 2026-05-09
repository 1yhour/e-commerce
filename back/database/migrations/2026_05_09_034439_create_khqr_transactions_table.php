<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * KHQR is Cambodia's National QR Payment Standard (NBC / Bakong).
     * When a customer selects KHQR, we generate a QR code via the Bakong API
     * and store the details here. We poll the Bakong API using `md5` to check
     * whether the customer has scanned and confirmed payment.
     */
    public function up(): void
    {
        Schema::create('khqr_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            // Parent payment record (one-to-one)
            $table->foreignUuid('payment_id')->unique()->constrained('payments')->cascadeOnDelete();

            // ── Merchant info (stored per transaction for audit trail) ──────────
            $table->string('bakong_account_id', 100);  // e.g. "012345678@aclb"
            $table->string('merchant_name', 100);
            $table->string('merchant_city', 100)->default('Phnom Penh');

            // ── QR payload ───────────────────────────────────────────────────────
            $table->text('qr_string');           // Full EMV QR string to encode/display
            $table->string('qr_image_url', 512)->nullable(); // Pre-rendered QR image (S3 etc.)
            $table->string('md5', 32)->unique(); // Bakong API polling hash

            // ── Amount ───────────────────────────────────────────────────────────
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('USD'); // 'USD' or 'KHR'

            // ── Lifecycle timestamps ─────────────────────────────────────────────
            $table->enum('status', ['generated', 'scanned', 'paid', 'expired', 'failed'])
                  ->default('generated');
            $table->timestampTz('scanned_at')->nullable();  // Customer opened QR
            $table->timestampTz('paid_at')->nullable();     // Bakong confirmed payment
            $table->timestampTz('expires_at');              // QR validity window
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('khqr_transactions');
    }
};