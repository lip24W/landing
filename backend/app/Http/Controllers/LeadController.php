<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index()
    {
        return response()->json(Lead::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'nullable|string|max:255',
            'phone'   => 'required|string|max:30',
            'subject' => 'nullable|string|max:500',
            'url'     => 'nullable|url|max:500',
        ]);

        $lead = Lead::create($data);

        return response()->json($lead, 201);
    }
}
