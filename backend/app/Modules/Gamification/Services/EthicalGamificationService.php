<?php

declare(strict_types=1);

namespace App\Modules\Gamification\Services;

use App\Modules\Gamification\Domain\Models\StudentBadge;
use App\Modules\Gamification\Domain\Models\StudentStreak;
use App\Modules\Gamification\Domain\Models\XpLedger;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class EthicalGamificationService
{
    /**
     * @return array{
     *   xp_awarded: int,
     *   total_xp: int,
     *   current_streak_days: int,
     *   longest_streak_days: int,
     *   streak_freezes_available: int,
     *   badges: array<int, array<string, mixed>>
     * }
     */
    public function recordVerifiedAcademicActivity(
        StudentProfile $student,
        string $sourceType,
        int $sourceId,
        int $xpPoints,
        string $reasonBn,
        ?string $activityDate = null
    ): array {
        $todayStr = $activityDate ?? Carbon::today()->toDateString();
        $today = Carbon::parse($todayStr)->startOfDay();

        return DB::transaction(function () use (
            $student,
            $sourceType,
            $sourceId,
            $xpPoints,
            $reasonBn,
            $todayStr,
            $today
        ): array {
            $existingLedger = XpLedger::query()
                ->where('student_id', $student->id)
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->first();

            $awardedNow = 0;
            if ($existingLedger === null) {
                XpLedger::query()->create([
                    'student_id' => $student->id,
                    'source_type' => $sourceType,
                    'source_id' => $sourceId,
                    'xp_points' => $xpPoints,
                    'reason_bn' => $reasonBn,
                    'earned_date' => $todayStr,
                ]);
                $awardedNow = $xpPoints;
            }

            /** @var StudentStreak $streak */
            $streak = StudentStreak::query()->firstOrCreate(
                ['student_id' => $student->id],
                [
                    'current_streak_days' => 0,
                    'longest_streak_days' => 0,
                    'streak_freezes_available' => 1,
                    'leaderboard_opt_in' => true,
                    'leaderboard_pseudonym_bn' => 'শিক্ষার্থী-'.substr($student->student_code, -4),
                ]
            );

            $lastDate = $streak->last_active_date?->copy()->startOfDay();

            if ($lastDate === null) {
                $streak->current_streak_days = 1;
            } else {
                $diffDays = (int) $lastDate->diffInDays($today, false);
                if ($diffDays === 1) {
                    $streak->current_streak_days += 1;
                } elseif ($diffDays === 2 && $streak->streak_freezes_available > 0) {
                    // Use Streak Freeze to protect streak over 1 missed day
                    $streak->streak_freezes_available -= 1;
                    $streak->current_streak_days += 1;
                } elseif ($diffDays > 1) {
                    $streak->current_streak_days = 1;
                }
            }

            $streak->longest_streak_days = max($streak->longest_streak_days, $streak->current_streak_days);
            $streak->last_active_date = $today;
            $streak->save();

            $totalXp = (int) XpLedger::query()
                ->where('student_id', $student->id)
                ->sum('xp_points');

            if ($totalXp >= 50) {
                StudentBadge::query()->firstOrCreate(
                    [
                        'student_id' => $student->id,
                        'badge_code' => 'BADGE_SCHOLAR_STARTER',
                    ],
                    [
                        'title_bn' => 'উদ্যমী শিক্ষার্থী (৫০+ এক্সপি অর্জিত)',
                        'awarded_at' => Carbon::now(),
                    ]
                );
            }

            if ($streak->current_streak_days >= 3) {
                StudentBadge::query()->firstOrCreate(
                    [
                        'student_id' => $student->id,
                        'badge_code' => 'BADGE_STREAK_3D',
                    ],
                    [
                        'title_bn' => 'ধারাবাহিক সাধক (৩ দিনের স্ট্রিক)',
                        'awarded_at' => Carbon::now(),
                    ]
                );
            }

            $badgeModels = StudentBadge::query()
                ->where('student_id', $student->id)
                ->orderBy('id')
                ->get();

            $badges = [];
            foreach ($badgeModels as $b) {
                $badges[] = [
                    'badge_code' => $b->badge_code,
                    'title_bn' => $b->title_bn,
                    'awarded_at' => $b->awarded_at->toIso8601String(),
                ];
            }

            return [
                'xp_awarded' => $awardedNow,
                'total_xp' => $totalXp,
                'current_streak_days' => $streak->current_streak_days,
                'longest_streak_days' => $streak->longest_streak_days,
                'streak_freezes_available' => $streak->streak_freezes_available,
                'badges' => $badges,
            ];
        });
    }

    /**
     * @return array<int, array{
     *   rank: int,
     *   pseudonym_bn: string,
     *   total_xp: int,
     *   current_streak_days: int
     * }>
     */
    public function getCohortLeaderboard(int $classLevel = 8): array
    {
        $optedInStreaks = StudentStreak::query()
            ->where('leaderboard_opt_in', true)
            ->get();

        $rows = [];
        foreach ($optedInStreaks as $streak) {
            /** @var StudentProfile|null $student */
            $student = StudentProfile::query()->find($streak->student_id);
            if ($student === null || (int) $student->current_class_level !== $classLevel) {
                continue;
            }
            $totalXp = (int) XpLedger::query()
                ->where('student_id', $student->id)
                ->sum('xp_points');

            $rows[] = [
                'pseudonym_bn' => $streak->leaderboard_pseudonym_bn ?? ('শিক্ষার্থী-'.substr($student->student_code, -4)),
                'total_xp' => $totalXp,
                'current_streak_days' => $streak->current_streak_days,
            ];
        }

        usort($rows, fn (array $a, array $b): int => $b['total_xp'] <=> $a['total_xp']);

        $ranked = [];
        foreach ($rows as $idx => $row) {
            $ranked[] = [
                'rank' => $idx + 1,
                'pseudonym_bn' => $row['pseudonym_bn'],
                'total_xp' => $row['total_xp'],
                'current_streak_days' => $row['current_streak_days'],
            ];
        }

        return $ranked;
    }
}
