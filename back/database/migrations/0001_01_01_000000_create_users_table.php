<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('email', 255)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255);
            $table->string('status', 20)->default('active'); // Enum logic should be handled in the Model/Casts
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes()->index(); // Indexed for faster soft-delete filtering
            
            $table->index('email'); // Explicit index as requested, though unique() already creates an index
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};