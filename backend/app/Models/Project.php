<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name', 'photo', 'area', 'floors', 'living', 'terrace',
        'bed', 'bath', 'features',
        'plan_area', 'plan_floors', 'plan_bed', 'plan_bath', 'floor_plans',
    ];

    protected $casts = [
        'features'    => 'array',
        'floor_plans' => 'array',
    ];

    protected $appends = ['photo_url', 'plans'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }

    public function getPlansAttribute(): array
    {
        return collect($this->floor_plans ?? [])->map(fn($p) => asset('storage/' . $p))->all();
    }
}
