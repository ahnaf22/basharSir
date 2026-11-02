<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Subscriptions\Seeders\SubscriptionPlanSeeder;
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
            SubscriptionPlanSeeder::class,
            NctbClassOneToTenExpansionSeeder::class,
        ]);
    }
}
