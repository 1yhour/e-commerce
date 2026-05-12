<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'id' => '12345678-e123-4567-e89b-12d3a4567890',
                'name' => 'Women',
                'slug' => 'women',
            ],
            [
                'id' => '123e4567-e89b-12d3-a456-426614174000',
                'name' => 'Men',
                'slug' => 'men',
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'name' => 'Kids',
                'slug' => 'kids',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['id' => $cat['id']], $cat);
        }
    }
}
