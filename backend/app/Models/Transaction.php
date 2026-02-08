<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'currency',
        'description',
        'transaction_date',
        'type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    // Relationship: Transaction belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: Transaction belongs to Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
