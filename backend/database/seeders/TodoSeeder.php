<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Todo;

class TodoSeeder extends Seeder
{
    public function run(): void
    {
        Todo::create(['title' => 'Learn React', 'completed' => false]);
        Todo::create(['title' => 'Build Todo App', 'completed' => false]);
        Todo::create(['title' => 'Setup Laravel API', 'completed' => true]);
        Todo::create(['title' => 'Configure XAMPP', 'completed' => true]);
    }
}
