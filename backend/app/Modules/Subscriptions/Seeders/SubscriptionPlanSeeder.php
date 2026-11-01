<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Seeders;

use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

final class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => 'PLAN-FREE-MONTHLY',
                'name_bn' => 'ফ্রি ট্রায়াল (Free Tier)',
                'name_en' => 'Free Tier',
                'tier' => 'free',
                'price_bdt' => 0,
                'billing_cycle' => 'monthly',
                'daily_ai_turns_limit' => 15,
                'monthly_exams_limit' => 2,
                'max_children_supported' => 1,
                'features_json' => [
                    'দৈনিক ১৫টি এআই টিউটর টার্ন',
                    'মাসে ২টি অধ্যায়ভিত্তিক কুইজ',
                    'এনসিটিবি পাঠ্যবইয়ের নোট ও সূত্র',
                ],
                'is_active' => true,
            ],
            [
                'code' => 'PLAN-BASIC-MONTHLY',
                'name_bn' => 'বেসিক টিউটর প্ল্যান (Basic)',
                'name_en' => 'Basic Tutor Plan',
                'tier' => 'basic',
                'price_bdt' => 499,
                'billing_cycle' => 'monthly',
                'daily_ai_turns_limit' => 40,
                'monthly_exams_limit' => 15,
                'max_children_supported' => 1,
                'features_json' => [
                    'দৈনিক ৪০টি এআই টিউটর টার্ন',
                    'মাসে ১৫টি অধ্যায় ও বিষয়ভিত্তিক পরীক্ষা',
                    'ব্যক্তিগত স্টাডি প্ল্যান ও সাপ্তাহিক প্যারেন্ট রিপোর্ট',
                ],
                'is_active' => true,
            ],
            [
                'code' => 'PLAN-PREMIUM-MONTHLY',
                'name_bn' => 'প্রিমিয়াম হোম টিউটর (Premium)',
                'name_en' => 'Premium Home Tutor',
                'tier' => 'premium',
                'price_bdt' => 999,
                'billing_cycle' => 'monthly',
                'daily_ai_turns_limit' => 200,
                'monthly_exams_limit' => 60,
                'max_children_supported' => 1,
                'features_json' => [
                    'দৈনিক ২০০টি এআই টিউটর টার্ন (আনলিমিটেড পাঠ অনুশীলন)',
                    'মাসে ৬০টি সৃজনশীল ও মডেল বোর্ড পরীক্ষা',
                    'হাতের লেখার উত্তরপত্র মূল্যায়ন ও বিস্তারিত রুব্রিক বিশ্লেষণ',
                ],
                'is_active' => true,
            ],
            [
                'code' => 'PLAN-FAMILY-MONTHLY',
                'name_bn' => 'ফ্যামিলি প্যাক (Family — সর্বোচ্চ ৩ সন্তান)',
                'name_en' => 'Family Pack (Up to 3 Children)',
                'tier' => 'family',
                'price_bdt' => 1499,
                'billing_cycle' => 'monthly',
                'daily_ai_turns_limit' => 300,
                'monthly_exams_limit' => 100,
                'max_children_supported' => 3,
                'features_json' => [
                    'সর্বোচ্চ ৩ জন সন্তানের জন্য প্রিমিয়াম সুবিধা',
                    'দৈনিক ৩০০টি এআই টিউটর টার্ন ও ১০০টি মাসিক পরীক্ষা',
                    'অভিভাবক পোর্টালে সকল সন্তানের পিডিএফ রিপোর্ট কার্ড',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::query()->updateOrCreate(
                ['code' => $plan['code']],
                $plan
            );
        }
    }
}
