<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 500);
        $shipping = 5.00;
        $total = $subtotal + $shipping;

        return [
            'id' => 'ORD-' . date('Y') . '-' . strtoupper($this->faker->bothify('?#?#?#')),
            'user_id' => User::factory(),
            'address_id' => Address::factory(),
            'status' => Order::STATUS_PENDING,
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'shipping_fee' => $shipping,
            'total_amount' => $total,
            'note' => $this->faker->optional()->sentence(),
        ];
    }
}
