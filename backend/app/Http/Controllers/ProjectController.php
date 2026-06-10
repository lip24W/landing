<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index()
    {
        return response()->json(Project::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'area'        => 'required|integer|min:1',
            'floors'      => 'required|integer|min:1|max:10',
            'living'      => 'required|integer|min:0',
            'terrace'     => 'nullable|integer|min:0',
            'bed'         => 'nullable|integer|min:0',
            'bath'        => 'nullable|integer|min:0',
            'features'    => 'nullable|string',       // JSON string from FormData
            'plan_area'   => 'nullable|integer|min:0',
            'plan_floors' => 'nullable|integer|min:1',
            'plan_bed'    => 'nullable|integer|min:0',
            'plan_bath'   => 'nullable|integer|min:0',
            'photo'       => 'required|image',
            'floor_plans' => 'nullable|array',
            'floor_plans.*' => 'image',
        ]);

        $photo = $request->file('photo')->store('projects', 'public');

        $floorPlans = [];
        if ($request->hasFile('floor_plans')) {
            foreach ($request->file('floor_plans') as $file) {
                $floorPlans[] = $file->store('plans', 'public');
            }
        }

        $project = Project::create([
            'name'        => $data['name'],
            'photo'       => $photo,
            'area'        => $data['area'],
            'floors'      => $data['floors'],
            'living'      => $data['living'],
            'terrace'     => $data['terrace'] ?? 0,
            'bed'         => $data['bed'] ?? 0,
            'bath'        => $data['bath'] ?? 0,
            'features'    => $data['features'] ? json_decode($data['features'], true) : [],
            'plan_area'   => $data['plan_area'] ?? $data['area'],
            'plan_floors' => $data['plan_floors'] ?? $data['floors'],
            'plan_bed'    => $data['plan_bed'] ?? $data['bed'] ?? 0,
            'plan_bath'   => $data['plan_bath'] ?? $data['bath'] ?? 0,
            'floor_plans' => $floorPlans,
        ]);

        return response()->json($project, 201);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'area'        => 'sometimes|required|integer|min:1',
            'floors'      => 'sometimes|required|integer|min:1|max:10',
            'living'      => 'sometimes|required|integer|min:0',
            'terrace'     => 'nullable|integer|min:0',
            'bed'         => 'nullable|integer|min:0',
            'bath'        => 'nullable|integer|min:0',
            'features'    => 'nullable|string',
            'plan_area'   => 'nullable|integer|min:0',
            'plan_floors' => 'nullable|integer|min:1',
            'plan_bed'    => 'nullable|integer|min:0',
            'plan_bath'   => 'nullable|integer|min:0',
            'photo'       => 'nullable|image',
            'floor_plans' => 'nullable|array',
            'floor_plans.*' => 'image',
        ]);

        if ($request->hasFile('photo')) {
            Storage::disk('public')->delete($project->photo);
            $data['photo'] = $request->file('photo')->store('projects', 'public');
        }

        if ($request->hasFile('floor_plans')) {
            foreach ($project->floor_plans ?? [] as $old) {
                Storage::disk('public')->delete($old);
            }
            $floorPlans = [];
            foreach ($request->file('floor_plans') as $file) {
                $floorPlans[] = $file->store('plans', 'public');
            }
            $data['floor_plans'] = $floorPlans;
        }

        if (isset($data['features'])) {
            $data['features'] = json_decode($data['features'], true);
        }

        $project->update($data);

        return response()->json($project->fresh());
    }

    public function destroy(Project $project)
    {
        Storage::disk('public')->delete($project->photo);
        foreach ($project->floor_plans ?? [] as $p) {
            Storage::disk('public')->delete($p);
        }
        $project->delete();

        return response()->json(null, 204);
    }
}
