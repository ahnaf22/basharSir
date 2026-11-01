<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Enums;

enum TutorLessonStage: string
{
    case START_LESSON = 'START_LESSON';
    case CHECK_PREREQUISITES = 'CHECK_PREREQUISITES';
    case TEACH_PREREQUISITE = 'TEACH_PREREQUISITE';
    case EXPLAIN_CONCEPT = 'EXPLAIN_CONCEPT';
    case WORKED_EXAMPLE = 'WORKED_EXAMPLE';
    case ASK_STUDENT_QUESTION = 'ASK_STUDENT_QUESTION';
    case IDENTIFY_MISCONCEPTION = 'IDENTIFY_MISCONCEPTION';
    case EXPLAIN_CORRECTION = 'EXPLAIN_CORRECTION';
    case ASK_SIMILAR_QUESTION = 'ASK_SIMILAR_QUESTION';
    case INCREASE_DIFFICULTY = 'INCREASE_DIFFICULTY';
    case MINI_ASSESSMENT = 'MINI_ASSESSMENT';
    case SAVE_LEARNING_PROGRESS = 'SAVE_LEARNING_PROGRESS';
    case COMPLETED = 'COMPLETED';

    /**
     * Maps the 13 internal engine states onto the 7 user-facing pedagogical steps
     * displayed in the Left Pane progression rail.
     */
    public function pedagogicalRailStep(): int
    {
        return match ($this) {
            self::START_LESSON => 1,
            self::CHECK_PREREQUISITES, self::TEACH_PREREQUISITE => 2,
            self::EXPLAIN_CONCEPT, self::WORKED_EXAMPLE => 3,
            self::ASK_STUDENT_QUESTION, self::IDENTIFY_MISCONCEPTION, self::EXPLAIN_CORRECTION, self::ASK_SIMILAR_QUESTION => 4,
            self::INCREASE_DIFFICULTY => 5,
            self::MINI_ASSESSMENT => 6,
            self::SAVE_LEARNING_PROGRESS, self::COMPLETED => 7,
        };
    }

    public function labelBn(): string
    {
        return match ($this) {
            self::START_LESSON => 'পাঠের সূচনা ও শিখনফল',
            self::CHECK_PREREQUISITES => 'পূর্বজ্ঞান যাচাই',
            self::TEACH_PREREQUISITE => 'পূর্বজ্ঞান পুনরালোচনা',
            self::EXPLAIN_CONCEPT => 'মূল ধারণা ব্যাখ্যা',
            self::WORKED_EXAMPLE => 'ধাপে ধাপে আদর্শ উদাহরণ',
            self::ASK_STUDENT_QUESTION => 'ইন্টারেক্টিভ অনুশীলন',
            self::IDENTIFY_MISCONCEPTION => 'ভুল ধারণা শনাক্তকরণ',
            self::EXPLAIN_CORRECTION => 'সংশোধনী ব্যাখ্যা',
            self::ASK_SIMILAR_QUESTION => 'সমজাতীয় অনুশীলন',
            self::INCREASE_DIFFICULTY => 'উচ্চতর দক্ষতার অনুশীলন',
            self::MINI_ASSESSMENT => 'সংক্ষিপ্ত মূল্যায়ন (Mini-Assessment)',
            self::SAVE_LEARNING_PROGRESS, self::COMPLETED => 'পাঠ সমাপ্তি ও অগ্রগতি সংরক্ষণ',
        };
    }
}
