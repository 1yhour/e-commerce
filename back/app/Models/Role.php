<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['name'];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    | ROLES ||--o{ USERS : "assigns"
    */

    /** All users assigned to this role. */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}