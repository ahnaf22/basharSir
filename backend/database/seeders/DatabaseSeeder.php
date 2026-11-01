<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            NctbCurriculumSeeder::class,
            NctbLearningResourceSeeder::class,
            NctbQuestionBankSeeder::class,
            \App\Modules\Subscriptions\Seeders\SubscriptionPlanSeeder::class,
            NctbClassOneToTenExpansionSeeder::class,
        ]);
    }
}
