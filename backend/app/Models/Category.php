<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'color',
    ];

    // Relationship: Category belongs to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: Category has many Transactions
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
