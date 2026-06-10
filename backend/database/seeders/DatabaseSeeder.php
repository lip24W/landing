<?php

namespace Database\Seeders;

use App\Models\PortfolioItem;
use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (Project::count() === 0) {
            $projects = [
                ['ВУДСОКОЛ 251',        'proj-251s.png',   251, 2, 169, 24, 4, 2, ['Кабинет'],    ['plan-251-1.jpg','plan-251-2.jpg']],
                ['ВУДСОКОЛ 136',        'proj-136-new.jpg',136, 1,  74, 38, 2, 2, ['Сауна'],       ['plan-136-1.jpg']],
                ['ВУДСОКОЛ Мастер 321', 'proj-321.jpg',    321, 2, 210, 39, 4, 5, ['4 гардероба'],['plan-321-1.jpg','plan-321-2.jpg']],
                ['ВУДСОКОЛ 221',        'proj-221.jpg',    221, 1, 150, 46, 4, 3, [],              ['plan-221-1.jpg']],
                ['ВУДСОКОЛ 76',         'proj-76.jpg',      76, 1,  59,  0, 3, 1, [],              ['plan-76-1.jpg']],
                ['ВУДСОКОЛ 243',        'proj-243.jpg',    243, 2, 179,  0, 5, 2, ['Сауна'],       ['plan-243-1.jpg','plan-243-2.jpg']],
                ['ВУДСОКОЛ 311',        'proj-311.jpg',    311, 1, 205, 77, 4, 3, ['Игровая'],     ['plan-311-1.jpg']],
                ['ВУДСОКОЛ 236',        'proj-236.jpg',    236, 1, 156, 48, 4, 2, ['Сауна'],       ['plan-236-1.jpg']],
                ['ВУДСОКОЛ 322',        'proj-322.jpg',    322, 2, 218,  0, 4, 3, ['Кабинет'],     ['plan-322-1.jpg','plan-322-2.jpg']],
                ['ВУДСОКОЛ 240',        'proj-240.jpg',    240, 2, 127,  0, 3, 3, ['Сауна'],       ['plan-240-1.jpg','plan-240-2.jpg']],
                ['ВУДСОКОЛ 156',        'proj-156.jpg',    156, 1,  98, 34, 2, 1, [],              ['plan-156-1.jpg']],
                ['ВУДСОКОЛ 299',        'proj-299.jpg',    299, 2, 187, 61, 3, 2, ['Кабинет'],     ['plan-299-1.jpg','plan-299-2.jpg']],
            ];

            foreach ($projects as [$name, $photo, $area, $floors, $living, $terrace, $bed, $bath, $features, $plans]) {
                Project::create([
                    'name'        => $name,
                    'photo'       => 'projects/' . $photo,
                    'area'        => $area,
                    'floors'      => $floors,
                    'living'      => $living,
                    'terrace'     => $terrace,
                    'bed'         => $bed,
                    'bath'        => $bath,
                    'features'    => $features,
                    'plan_area'   => $area,
                    'plan_floors' => $floors,
                    'plan_bed'    => $bed,
                    'plan_bath'   => $bath,
                    'floor_plans' => array_map(fn($p) => 'plans/' . $p, $plans),
                ]);
            }
        }

        if (PortfolioItem::count() === 0) {
            $photos = [
                'port-1.jpg','port-0a.jpg','port-3.jpg','port-5.jpg','port-0b.jpg','port-0c.jpg',
                'port-7.jpg','port-0d.jpg','port-9.jpg','port-0e.jpg','port-14.jpg','port-16.jpg',
                'port-2.jpg','port-4.jpg','port-6.jpg','port-8.jpg','port-10.jpg','port-18.jpg',
                'port-11.jpg','port-12.jpg','port-13.jpg','port-15.jpg','port-17.jpg','port-19.jpg',
                'port-20.jpg','port-21.jpg',
            ];

            foreach ($photos as $i => $photo) {
                PortfolioItem::create(['photo' => 'portfolio/' . $photo, 'sort_order' => $i]);
            }
        }
    }
}
