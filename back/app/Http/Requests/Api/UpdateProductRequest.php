<?php
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id;

        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug,' . $productId,
            'category_id' => 'required|uuid|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer',
            'description' => 'nullable|string',
            'tag' => 'nullable|string',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ];
    }
}
