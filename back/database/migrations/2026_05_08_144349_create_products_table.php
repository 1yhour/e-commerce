<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->decimal('base_price', 12, 2);
            $table->string('status', 20); // Enum mapped in Model
            $table->jsonb('metadata')->default(json_encode([])); // JSONB for Postgres optimization
            
            // Note: tsvector is PostgreSQL specific. 
            // If using MySQL, change this to $table->text('search_vector')->nullable();
            $table->addColumn('tsvector', 'search_vector')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('slug');
        });
        
        // Optional: Add raw SQL here to create a generated tsvector column or trigger 
        // depending on your exact PostgreSQL requirements.
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};