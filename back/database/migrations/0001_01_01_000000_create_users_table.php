<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('role_id')->nullable(); // FK to roles added after roles table is created
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('phone', 20)->nullable();
            // Telegram: admin users link their Telegram account to receive bot alerts
            $table->bigInteger('telegram_chat_id')->nullable()->unique();
            $table->string('telegram_username', 100)->nullable();
            // JWT: stores the last-invalidated token identifier for logout
            $table->string('remember_token', 100)->nullable();
            $table->timestampsTz();
            $table->softDeletesTz('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};