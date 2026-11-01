<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\DTOs\PiiScrubResultData;
use App\Modules\AI\DTOs\SafetyGuardrailResultData;

final class PiiScrubberService
{
    /**
     * Scrub Bangladesh PDPA 2026 PII from text before sending to external LLM providers.
     *
     * @param  array<int, string|null>  $knownSensitiveLiterals
     */
    public function scrub(string $text, array $knownSensitiveLiterals = []): PiiScrubResultData
    {
        $redactedCount = 0;
        $sanitized = $text;

        // 1. Redact explicit student/guardian/school names provided from profile context
        foreach ($knownSensitiveLiterals as $literal) {
            if ($literal === null) {
                continue;
            }
            $trimmed = trim($literal);
            if (mb_strlen($trimmed) < 2) {
                continue;
            }

            $pattern = '/'.preg_quote($trimmed, '/').'/iu';
            $matches = preg_match_all($pattern, $sanitized);
            if (is_int($matches) && $matches > 0) {
                $redactedCount += $matches;
                $sanitized = (string) preg_replace($pattern, '[REDACTED_STUDENT_PII]', $sanitized);
            }
        }

        // 2. Redact Bangladeshi mobile numbers (ASCII +8801XXXXXXXXX, 8801XXXXXXXXX, 01[3-9]XXXXXXXX)
        $asciiPhonePattern = '/(?:\+?880|0)1[3-9]\d{8}\b/u';
        $asciiPhoneMatches = preg_match_all($asciiPhonePattern, $sanitized);
        if (is_int($asciiPhoneMatches) && $asciiPhoneMatches > 0) {
            $redactedCount += $asciiPhoneMatches;
            $sanitized = (string) preg_replace($asciiPhonePattern, '[REDACTED_BD_PHONE]', $sanitized);
        }

        // 3. Redact Bangladeshi mobile numbers in Bangla numerals (e.g. +৮৮০১..., ০১[৩-৯]...)
        $banglaPhonePattern = '/(?:\+?৮৮০|০)১[৩-৯][০-৯]{8}/u';
        $banglaPhoneMatches = preg_match_all($banglaPhonePattern, $sanitized);
        if (is_int($banglaPhoneMatches) && $banglaPhoneMatches > 0) {
            $redactedCount += $banglaPhoneMatches;
            $sanitized = (string) preg_replace($banglaPhonePattern, '[REDACTED_BD_PHONE]', $sanitized);
        }

        // 4. Redact email addresses
        $emailPattern = '/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/u';
        $emailMatches = preg_match_all($emailPattern, $sanitized);
        if (is_int($emailMatches) && $emailMatches > 0) {
            $redactedCount += $emailMatches;
            $sanitized = (string) preg_replace($emailPattern, '[REDACTED_EMAIL]', $sanitized);
        }

        // 5. Redact student codes (e.g., STD-2026-004812) if accidentally included
        $studentCodePattern = '/\bSTD-\d{4}-\d{4,8}\b/i';
        $codeMatches = preg_match_all($studentCodePattern, $sanitized);
        if (is_int($codeMatches) && $codeMatches > 0) {
            $redactedCount += $codeMatches;
            $sanitized = (string) preg_replace($studentCodePattern, '[REDACTED_STUDENT_CODE]', $sanitized);
        }

        return new PiiScrubResultData(
            sanitizedText: $sanitized,
            redactedCount: $redactedCount,
            promptHash: hash('sha256', $sanitized),
        );
    }

    /**
     * Strip unverified external URLs from AI-generated output (child safety rule).
     */
    public function stripExternalUrls(string $outputText): string
    {
        return (string) preg_replace('/https?:\/\/[^\s)"\'>]+/iu', '[বহিরাগত লিংক অপসারিত]', $outputText);
    }

    /**
     * Evaluate student input against Child Safety & Anti-Cheating Homework Integrity rules.
     */
    public function checkSafetyGuardrails(string $inputText): SafetyGuardrailResultData
    {
        $normalized = mb_strtolower(trim($inputText));

        // 1. Check for self-harm, violence, or explicit unsafe content
        $unsafePatterns = [
            'আত্মহত্যা',
            'নিজেকে শেষ',
            'suicide',
            'self harm',
            'kill myself',
            'হ্যাক করা',
            'বোমা তৈরি',
        ];

        foreach ($unsafePatterns as $keyword) {
            if (mb_strpos($normalized, $keyword) !== false) {
                return new SafetyGuardrailResultData(
                    isSafe: false,
                    isHomeworkShortcutAttempt: false,
                    violationCode: 'CHILD_SAFETY_BLOCKED_TOPIC',
                    redirectMessageBn: 'আমি তোমার পড়াশোনার সহকারী গৃহশিক্ষক। চলো আমরা আবার আজকের অধ্যায়ের পাঠে ফিরে যাই! তোমার কোনো সহায়তার প্রয়োজন হলে অভিভাবক বা শিক্ষকের সাথে কথা বলো।',
                );
            }
        }

        // 2. Check for Homework Integrity / Anti-Cheating shortcut prompts
        $shortcutPatterns = [
            'শুধু উত্তরটা লিখে দাও',
            'শুধু উত্তর দাও',
            'ব্যাখ্যা লাগবে না শুধু উত্তর',
            'just give me the final answer',
            'just give me the answer',
            'do my homework for me',
        ];

        foreach ($shortcutPatterns as $shortcut) {
            if (mb_strpos($normalized, $shortcut) !== false) {
                return new SafetyGuardrailResultData(
                    isSafe: true,
                    isHomeworkShortcutAttempt: true,
                    violationCode: 'HOMEWORK_SHORTCUT_DETECTED',
                    redirectMessageBn: 'সরাসরি চূড়ান্ত উত্তর দিলে তোমার শেখাটা সম্পূর্ণ হবে না! চলো আমরা ধাপে ধাপে একসাথে সমাধান করি। প্রথমে বলো, এই অঙ্কে কী কী মান দেওয়া আছে?',
                );
            }
        }

        return new SafetyGuardrailResultData(
            isSafe: true,
            isHomeworkShortcutAttempt: false,
        );
    }
}
