<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo')->nullable();      // path in storage
            $table->unsignedSmallInteger('area')->default(0);
            $table->unsignedTinyInteger('floors')->default(1);
            $table->unsignedSmallInteger('living')->default(0);
            $table->unsignedSmallInteger('terrace')->default(0);
            $table->unsignedTinyInteger('bed')->default(0);
            $table->unsignedTinyInteger('bath')->default(0);
            $table->json('features')->nullable();     // ["Сауна","Кабинет"]
            // plan modal
            $table->unsignedSmallInteger('plan_area')->default(0);
            $table->unsignedTinyInteger('plan_floors')->default(1);
            $table->unsignedTinyInteger('plan_bed')->default(0);
            $table->unsignedTinyInteger('plan_bath')->default(0);
            $table->json('floor_plans')->nullable();  // ["/storage/plans/..."]
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
