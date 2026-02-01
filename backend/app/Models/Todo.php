<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    protected $fillable = [
        'title',
        'completed',
        'user_id'  // Adaugă asta
    ];

    protected $casts = [
        'completed' => 'boolean'
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
