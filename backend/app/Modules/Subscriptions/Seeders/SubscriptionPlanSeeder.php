<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Seeders;

use App\Modules\Subscriptions\Domain\Models\PlanEntitlement;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

final class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'plan' => [
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
                'entitlements' => [
                    ['feature_key' => 'ai_tutor.daily_turns', 'is_enabled' => true, 'quota_limit' => 15, 'description_bn' => 'দৈনিক এআই টিউটর টার্ন সীমা'],
                    ['feature_key' => 'exams.monthly', 'is_enabled' => true, 'quota_limit' => 2, 'description_bn' => 'মাসে অধ্যায়ভিত্তিক পরীক্ষার সীমা'],
                    ['feature_key' => 'materials.pdf_download', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'অধ্যায় নোটের ওয়াটারমার্কযুক্ত PDF ডাউনলোড'],
                    ['feature_key' => 'group_learning.join', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'সহপাঠীদের গ্রুপ স্টাডি রুমে যোগদান'],
                    ['feature_key' => 'group_learning.create', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'নতুন গ্রুপ স্টাডি রুম তৈরি'],
                    ['feature_key' => 'handwriting_ocr.monthly', 'is_enabled' => false, 'quota_limit' => 0, 'description_bn' => 'হাতের লেখার উত্তরপত্র স্ক্যান ও মূল্যায়ন'],
                    ['feature_key' => 'teacher_marketplace.booking', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'লাইভ শিক্ষক ক্লাস বুকিং'],
                    ['feature_key' => 'parent.weekly_pdf_report', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'অভিভাবক সাপ্তাহিক একাডেমিক প্রগ্রেস PDF'],
                    ['feature_key' => 'guardian.max_children', 'is_enabled' => true, 'quota_limit' => 1, 'description_bn' => 'সর্বোচ্চ যুক্তযোগ্য শিক্ষার্থীর সংখ্যা'],
                ],
            ],
            [
                'plan' => [
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
                        'মাসে ৫টি হাতের লেখা উত্তরপত্র মূল্যায়ন',
                    ],
                    'is_active' => true,
                ],
                'entitlements' => [
                    ['feature_key' => 'ai_tutor.daily_turns', 'is_enabled' => true, 'quota_limit' => 40, 'description_bn' => 'দৈনিক এআই টিউটর টার্ন সীমা'],
                    ['feature_key' => 'exams.monthly', 'is_enabled' => true, 'quota_limit' => 15, 'description_bn' => 'মাসে অধ্যায়ভিত্তিক পরীক্ষার সীমা'],
                    ['feature_key' => 'materials.pdf_download', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অধ্যায় নোটের ওয়াটারমার্কযুক্ত PDF ডাউনলোড'],
                    ['feature_key' => 'group_learning.join', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'সহপাঠীদের গ্রুপ স্টাডি রুমে যোগদান'],
                    ['feature_key' => 'group_learning.create', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'নতুন গ্রুপ স্টাডি রুম তৈরি'],
                    ['feature_key' => 'handwriting_ocr.monthly', 'is_enabled' => true, 'quota_limit' => 5, 'description_bn' => 'হাতের লেখার উত্তরপত্র স্ক্যান ও মূল্যায়ন'],
                    ['feature_key' => 'teacher_marketplace.booking', 'is_enabled' => false, 'quota_limit' => null, 'description_bn' => 'লাইভ শিক্ষক ক্লাস বুকিং'],
                    ['feature_key' => 'parent.weekly_pdf_report', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অভিভাবক সাপ্তাহিক একাডেমিক প্রগ্রেস PDF'],
                    ['feature_key' => 'guardian.max_children', 'is_enabled' => true, 'quota_limit' => 1, 'description_bn' => 'সর্বোচ্চ যুক্তযোগ্য শিক্ষার্থীর সংখ্যা'],
                ],
            ],
            [
                'plan' => [
                    'code' => 'PLAN-PREMIUM-MONTHLY',
                    'name_bn' => 'প্রিমিয়াম হোম টিউটর (Premium)',
                    'name_en' => 'Premium Home Tutor',
                    'tier' => 'premium',
                    'price_bdt' => 999,
                    'billing_cycle' => 'monthly',
                    'daily_ai_turns_limit' => 200,
                    'monthly_exams_limit' => 60,
                    'max_children_supported' => 2,
                    'features_json' => [
                        'দৈনিক ২০০টি এআই টিউটর টার্ন (আনলিমিটেড পাঠ অনুশীলন)',
                        'মাসে ৬০টি সৃজনশীল ও মডেল বোর্ড পরীক্ষা',
                        'হাতের লেখার উত্তরপত্র মূল্যায়ন (মাসে ৩০টি)',
                        'লাইভ শিক্ষক মার্কেটপ্লেস বুকিং সুবিধা',
                    ],
                    'is_active' => true,
                ],
                'entitlements' => [
                    ['feature_key' => 'ai_tutor.daily_turns', 'is_enabled' => true, 'quota_limit' => 200, 'description_bn' => 'দৈনিক এআই টিউটর টার্ন সীমা'],
                    ['feature_key' => 'exams.monthly', 'is_enabled' => true, 'quota_limit' => 60, 'description_bn' => 'মাসে অধ্যায়ভিত্তিক পরীক্ষার সীমা'],
                    ['feature_key' => 'materials.pdf_download', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অধ্যায় নোটের ওয়াটারমার্কযুক্ত PDF ডাউনলোড'],
                    ['feature_key' => 'group_learning.join', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'সহপাঠীদের গ্রুপ স্টাডি রুমে যোগদান'],
                    ['feature_key' => 'group_learning.create', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'নতুন গ্রুপ স্টাডি রুম তৈরি'],
                    ['feature_key' => 'handwriting_ocr.monthly', 'is_enabled' => true, 'quota_limit' => 30, 'description_bn' => 'হাতের লেখার উত্তরপত্র স্ক্যান ও মূল্যায়ন'],
                    ['feature_key' => 'teacher_marketplace.booking', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'লাইভ শিক্ষক ক্লাস বুকিং'],
                    ['feature_key' => 'parent.weekly_pdf_report', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অভিভাবক সাপ্তাহিক একাডেমিক প্রগ্রেস PDF'],
                    ['feature_key' => 'guardian.max_children', 'is_enabled' => true, 'quota_limit' => 2, 'description_bn' => 'সর্বোচ্চ যুক্তযোগ্য শিক্ষার্থীর সংখ্যা'],
                ],
            ],
            [
                'plan' => [
                    'code' => 'PLAN-FAMILY-MONTHLY',
                    'name_bn' => 'ফ্যামিলি প্যাক (Family — সর্বোচ্চ ৪ সন্তান)',
                    'name_en' => 'Family Pack (Up to 4 Children)',
                    'tier' => 'family',
                    'price_bdt' => 1499,
                    'billing_cycle' => 'monthly',
                    'daily_ai_turns_limit' => 300,
                    'monthly_exams_limit' => 100,
                    'max_children_supported' => 4,
                    'features_json' => [
                        'সর্বোচ্চ ৪ জন সন্তানের জন্য প্রিমিয়াম সুবিধা',
                        'দৈনিক ৩০০টি এআই টিউটর টার্ন ও ১০০টি মাসিক পরীক্ষা',
                        'অভিভাবক পোর্টালে সকল সন্তানের পিডিএফ রিপোর্ট কার্ড',
                        'হাতের লেখার উত্তরপত্র মূল্যায়ন ও লাইভ শিক্ষক সুবিধা',
                    ],
                    'is_active' => true,
                ],
                'entitlements' => [
                    ['feature_key' => 'ai_tutor.daily_turns', 'is_enabled' => true, 'quota_limit' => 300, 'description_bn' => 'দৈনিক এআই টিউটর টার্ন সীমা'],
                    ['feature_key' => 'exams.monthly', 'is_enabled' => true, 'quota_limit' => 100, 'description_bn' => 'মাসে অধ্যায়ভিত্তিক পরীক্ষার সীমা'],
                    ['feature_key' => 'materials.pdf_download', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অধ্যায় নোটের ওয়াটারমার্কযুক্ত PDF ডাউনলোড'],
                    ['feature_key' => 'group_learning.join', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'সহপাঠীদের গ্রুপ স্টাডি রুমে যোগদান'],
                    ['feature_key' => 'group_learning.create', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'নতুন গ্রুপ স্টাডি রুম তৈরি'],
                    ['feature_key' => 'handwriting_ocr.monthly', 'is_enabled' => true, 'quota_limit' => 30, 'description_bn' => 'হাতের লেখার উত্তরপত্র স্ক্যান ও মূল্যায়ন'],
                    ['feature_key' => 'teacher_marketplace.booking', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'লাইভ শিক্ষক ক্লাস বুকিং'],
                    ['feature_key' => 'parent.weekly_pdf_report', 'is_enabled' => true, 'quota_limit' => null, 'description_bn' => 'অভিভাবক সাপ্তাহিক একাডেমিক প্রগ্রেস PDF'],
                    ['feature_key' => 'guardian.max_children', 'is_enabled' => true, 'quota_limit' => 4, 'description_bn' => 'সর্বোচ্চ যুক্তযোগ্য শিক্ষার্থীর সংখ্যা'],
                ],
            ],
        ];

        foreach ($plans as $item) {
            /** @var SubscriptionPlan $planModel */
            $planModel = SubscriptionPlan::query()->updateOrCreate(
                ['code' => $item['plan']['code']],
                $item['plan']
            );

            foreach ($item['entitlements'] as $entitlement) {
                PlanEntitlement::query()->updateOrCreate(
                    [
                        'subscription_plan_id' => $planModel->id,
                        'feature_key' => $entitlement['feature_key'],
                    ],
                    $entitlement
                );
            }
        }
    }
}
