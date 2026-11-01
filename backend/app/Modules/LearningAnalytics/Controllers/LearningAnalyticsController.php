<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\LearningAnalytics\Services\LearningAnalyticsService;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

final class LearningAnalyticsController extends Controller
{
    public function __construct(
        private readonly LearningAnalyticsService $analyticsService,
    ) {}

    /**
     * GET /api/v1/analytics/me
     */
    public function myAnalytics(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile;
        if ($student === null) {
            return ApiResponse::error('STUDENT_PROFILE_NOT_FOUND', 'Student profile is required.', 404);
        }

        return ApiResponse::success(
            data: $this->analyticsService->buildFiveTierAnalytics($student)
        );
    }

    /**
     * GET /api/v1/guardians/children/{studentCode}/weekly-report
     */
    public function guardianChildWeeklyReport(string $studentCode): JsonResponse
    {
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('student_code', $studentCode)->firstOrFail();
        Gate::authorize('view', $student);

        return ApiResponse::success(
            data: $this->analyticsService->buildFiveTierAnalytics($student)
        );
    }

    /**
     * GET /api/v1/guardians/children/{studentCode}/weekly-report/pdf
     */
    public function downloadGuardianWeeklyReportPdf(string $studentCode): Response
    {
        /** @var StudentProfile $student */
        $student = StudentProfile::query()->where('student_code', $studentCode)->firstOrFail();
        Gate::authorize('view', $student);

        $pdfBinary = $this->analyticsService->generateWeeklyReportPdf($student);

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"weekly-report-{$student->student_code}.pdf\"",
        ]);
    }
}
