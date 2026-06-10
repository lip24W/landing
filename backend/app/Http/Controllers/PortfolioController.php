<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    public function index()
    {
        return response()->json(PortfolioItem::orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:20480']);

        $path = $request->file('photo')->store('portfolio', 'public');
        $item = PortfolioItem::create([
            'photo'      => $path,
            'sort_order' => PortfolioItem::max('sort_order') + 1,
        ]);

        return response()->json($item, 201);
    }

    public function destroy(PortfolioItem $portfolioItem)
    {
        Storage::disk('public')->delete($portfolioItem->photo);
        $portfolioItem->delete();

        return response()->json(null, 204);
    }
}
