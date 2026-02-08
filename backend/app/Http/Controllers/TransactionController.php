<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // GET /api/transactions
    public function index(Request $request)
    {
        $query = auth()->user()->transactions()->with('category');

        // Filtrare opțională pe tip
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtrare opțională pe categorie
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        return response()->json($transactions);
    }

    // POST /api/transactions
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|in:MDL,EUR,USD,RON',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
            'type' => 'required|in:income,expense',
        ]);

        // Verifică că categoria aparține user-ului
        $category = auth()->user()->categories()->find($validated['category_id']);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $transaction = auth()->user()->transactions()->create($validated);
        $transaction->load('category');

        return response()->json($transaction, 201);
    }

    // GET /api/transactions/{id}
    public function show(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->load('category');
        return response()->json($transaction);
    }

    // PUT/PATCH /api/transactions/{id}
    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'amount' => 'sometimes|numeric|min:0.01',
            'currency' => 'sometimes|in:MDL,EUR,USD,RON',
            'description' => 'nullable|string',
            'transaction_date' => 'sometimes|date',
            'type' => 'sometimes|in:income,expense',
        ]);

        $transaction->update($validated);
        $transaction->load('category');

        return response()->json($transaction);
    }

    // DELETE /api/transactions/{id}
    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
