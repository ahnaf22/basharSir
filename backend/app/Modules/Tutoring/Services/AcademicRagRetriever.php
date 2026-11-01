<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Services;

use App\Modules\AcademicContent\Domain\HybridRagChunkSearchService;
use App\Modules\Tutoring\DTOs\AcademicRagContextData;
use App\Modules\Tutoring\Models\TutorMessage;
use App\Modules\Tutoring\Models\TutorSession;
use Illuminate\Database\Eloquent\Collection;

final class AcademicRagRetriever
{
    public const MAX_INPUT_TOKEN_BUDGET = 3500;

    public function __construct(
        private readonly HybridRagChunkSearchService $ragChunkSearch,
    ) {}

    /**
     * Assembles a grounded, token-bounded (< 3,500 tokens) prompt context for a TutorSession turn.
     */
    public function buildContext(
        TutorSession $session,
        string $targetStage,
        string $studentActionType,
        ?string $studentInputText = null,
    ): AcademicRagContextData {
        $session->loadMissing(['activeObjective', 'topic', 'student']);

        $objective = $session->activeObjective;
        $gradeLevel = $session->student->current_class_level;

        // 1. Retrieve top k=3 NCTB grounding chunks (allocated up to 1,800 tokens out of 3,500 budget)
        $chunks = $this->ragChunkSearch
            ->retrieveForObjective($objective->id, null, 1800)
            ->take(3);

        $chunkTexts = [];
        $nctbRef = 'এনসিটিবি পাঠ্যবই (শ্রেণি '.$gradeLevel.')';

        foreach ($chunks as $chunk) {
            $chunkTexts[] = $chunk->chunk_text;
            if ($chunk->nctb_page_reference !== null && $chunk->nctb_page_reference !== '') {
                $nctbRef = $chunk->nctb_page_reference;
            }
        }

        // 2. Load only last 4 conversation turns + rolling compact summary (never full raw session history)
        /** @var Collection<int, TutorMessage> $recentTurns */
        $recentTurns = TutorMessage::query()
            ->where('tutor_session_id', $session->id)
            ->orderByDesc('id')
            ->limit(4)
            ->get()
            ->reverse()
            ->values();

        $recentTranscriptLines = [];
        foreach ($recentTurns as $turn) {
            $roleLabel = strtoupper($turn->sender_role);
            $snippet = $turn->student_input_text ?? (string) data_get($turn->structured_payload_json, 'explanation_bn', '');
            $recentTranscriptLines[] = "[{$roleLabel} | {$turn->lesson_stage}]: ".mb_substr($snippet, 0, 280);
        }

        $personaTone = match (true) {
            $gradeLevel <= 5 => 'অত্যন্ত সহজ, আনন্দময় ও উৎসাহব্যঞ্জক (Primary Grade 1-5)',
            $gradeLevel <= 8 => 'ধৈর্যশীল, উদাহরণভিত্তিক ও ধাপে ধাপে বিশ্লেষণধর্মী (Lower Secondary Grade 6-8)',
            default => 'বোর্ড পরীক্ষার মানদণ্ড অনুযায়ী সূক্ষ্ম ও গাণিতিকভাবে নিখুঁত (SSC Grade 9-10)',
        };

        $systemPrompt = implode("\n", [
            'তুমি বাংলাদেশের জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত একজন ব্যক্তিগত এআই গৃহশিক্ষক।',
            "শ্রেণি: {$gradeLevel} | শিক্ষাদানের ধরন: {$personaTone}",
            "শিখনফল কোড: {$objective->code} ({$objective->title_bn})",
            "সক্রিয় ধাপ (Stage): {$targetStage}",
            'নিয়মাবলি: শুধুমাত্র প্রদত্ত এনসিটিবি পাঠ্যবইয়ের তথ্যের ওপর ভিত্তি করে শেখাবে। সর্বদা নির্ধারিত JSON স্কিমায় উত্তর দেবে।',
            '--- NCTB GROUNDING CHUNKS ---',
            $chunkTexts !== [] ? implode("\n---\n", $chunkTexts) : 'পাঠ্যবইয়ের মূল সূত্র ও উদাহরণ অনুসরণ করো।',
        ]);

        $summarySection = $session->compact_summary_text !== null && $session->compact_summary_text !== ''
            ? "সংক্ষিপ্ত পূর্ব-সারাংশ: {$session->compact_summary_text}\n"
            : '';

        $userPrompt = implode("\n", [
            $summarySection,
            'সাম্প্রতিক ৪টি কথোপকথন:',
            implode("\n", $recentTranscriptLines),
            "শিক্ষার্থীর বর্তমান অ্যাকশন ({$studentActionType}): ".($studentInputText ?? 'পরবর্তী ধাপ'),
        ]);

        // Enforce strict < 3,500 token cap
        $estimatedTokens = (int) ceil((mb_strlen($systemPrompt) + mb_strlen($userPrompt)) / 3.5);
        if ($estimatedTokens >= self::MAX_INPUT_TOKEN_BUDGET) {
            $userPrompt = mb_substr($userPrompt, 0, 3500);
            $systemPrompt = mb_substr($systemPrompt, 0, 6500);
            $estimatedTokens = (int) ceil((mb_strlen($systemPrompt) + mb_strlen($userPrompt)) / 3.5);
        }

        return new AcademicRagContextData(
            systemPrompt: $systemPrompt,
            userPrompt: $userPrompt,
            ragChunkTexts: $chunkTexts,
            nctbReference: $nctbRef,
            estimatedInputTokens: min(self::MAX_INPUT_TOKEN_BUDGET - 1, $estimatedTokens),
        );
    }
}
