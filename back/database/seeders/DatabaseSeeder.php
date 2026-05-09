<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Models\Address;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);

        // 2. Create an Admin User
        User::factory()->create([
            'role_id'           => $adminRole->id,
            'first_name'        => env('ADMIN_FIRST_NAME', 'Super'),
            'last_name'         => env('ADMIN_LAST_NAME', 'Admin'),
            'email'             => env('ADMIN_EMAIL', 'admin@example.com'),
            'password_hash'     => Hash::make(env('ADMIN_PASSWORD', 'password')),
            'telegram_chat_id'  => env('ADMIN_TELEGRAM_CHAT_ID'),
            'telegram_username' => env('ADMIN_TELEGRAM_USERNAME'),
        ]);

        // 3. Create a Test Customer
        User::factory()->create([
            'role_id'       => $customerRole->id,
            'first_name'    => 'Test',
            'last_name'     => 'Customer',
            'email'         => 'customer@example.com',
            'password_hash' => Hash::make('password'),
        ]);

        // 4. Create some random customers
        User::factory(10)->create([
            'role_id' => $customerRole->id,
        ]);

        // 5. Create some products
        $products = Product::factory(20)->create();

        // 6. Create realistic orders for the Test Customer
        $testCustomer = User::where('email', 'customer@example.com')->first();
        
        $address = Address::factory()->create([
            'user_id' => $testCustomer->id,
            'is_default' => true,
        ]);

        $orders = Order::factory(5)->create([
            'user_id' => $testCustomer->id,
            'address_id' => $address->id,
        ]);

        foreach ($orders as $order) {
            // Add 2-4 items to each order
            OrderItem::factory(rand(2, 4))->create([
                'order_id' => $order->id,
                'product_id' => $products->random()->id,
            ]);
        }
    }
}
