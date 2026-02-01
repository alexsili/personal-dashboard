<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        // Ia doar todo-urile userului curent
        $todos = $request->user()->todos()->orderBy('created_at', 'desc')->get();

        return response()->json($todos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        // Creează todo pentru userul curent
        $todo = $request->user()->todos()->create([
            'title' => $request->title,
            'completed' => false
        ]);

        return response()->json($todo, 201);
    }

    public function update(Request $request, Todo $todo)
    {
        // Verifică că todo-ul aparține userului curent
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $todo->completed = !$todo->completed;
        $todo->save();

        return response()->json($todo->fresh());
    }

    public function destroy(Request $request, Todo $todo)
    {
        // Verifică că todo-ul aparține userului curent
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $todo->delete();

        return response()->json(['message' => 'Todo deleted']);
    }
}
