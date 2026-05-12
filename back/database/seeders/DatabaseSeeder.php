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
        // 0. Seed Categories
        $this->call(CategorySeeder::class);

        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $customerRole = Role::firstOrCreate(['name' => 'Customer']);

        // 2. Create a Static Admin User
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@luxe.com')],
            [
                'role_id'           => $adminRole->id,
                'first_name'        => env('ADMIN_FIRST_NAME', 'Super'),
                'last_name'         => env('ADMIN_LAST_NAME', 'Admin'),
                'password_hash'     => Hash::make(env('ADMIN_PASSWORD', 'admin123')),
                'telegram_chat_id'  => env('ADMIN_TELEGRAM_CHAT_ID'),
                'telegram_username' => env('ADMIN_TELEGRAM_USERNAME'),
            ]
        );

        // 3. Create a Static Test Customer
        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'role_id'       => $customerRole->id,
                'first_name'    => 'Test',
                'last_name'     => 'Customer',
                'password_hash' => Hash::make('password123'),
            ]
        );

        // 4. Create some random customers
        User::factory(10)->create([
            'role_id' => $customerRole->id,
        ]);


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

        
    }
}
