<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('primaryImage')
            ->when(request('category_id'), fn($q) =>
                $q->where('category_id', request('category_id'))
            )
            ->when(request('sort') === 'price_asc',  fn($q) => $q->orderBy('price'))
            ->when(request('sort') === 'price_desc', fn($q) => $q->orderByDesc('price'))
            ->when(request('sort') === 'name_asc',   fn($q) => $q->orderBy('title'))
            ->when(!request('sort') || request('sort') === 'latest', fn($q) => $q->latest())
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => $products]);
    }

    public function store(StoreProductRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();

            // FormData sends booleans as strings — cast explicitly
            $validated['is_active'] = filter_var(
                $validated['is_active'] ?? true,
                FILTER_VALIDATE_BOOLEAN
            );

            // Remove image from product data — stored separately
            unset($validated['image']);

            $product = Product::create($validated);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $product->images()->create([
                    'image_url'  => $path,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            return response()->json([
                'message' => 'Product created',
                'product' => $product->load('primaryImage'),
            ], 201);
        });
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['primaryImage', 'category']));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        return DB::transaction(function () use ($request, $product) {
            $validated = $request->validated();

            $validated['is_active'] = filter_var(
                $validated['is_active'] ?? $product->is_active,
                FILTER_VALIDATE_BOOLEAN
            );

            unset($validated['image']);

            $product->update($validated);

            if ($request->hasFile('image')) {
                // Delete old primary image from disk
                $old = $product->images()->where('is_primary', true)->first();
                if ($old) {
                    Storage::disk('public')->delete($old->image_url);
                    $old->delete();
                }

                $path = $request->file('image')->store('products', 'public');
                $product->images()->create([
                    'image_url'  => $path,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            return response()->json([
                'message' => 'Product updated',
                'product' => $product->fresh()->load('primaryImage'),
            ]);
        });
    }

    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_url);
                $image->delete();
            }
            $product->delete();
        });

        return response()->json(['message' => 'Product deleted']);
    }
}