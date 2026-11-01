<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\AcademicContent\Models\StudentResourceAnnotation;
use App\Modules\Identity\Domain\Enums\AccountType;

final readonly class SaveStudentResourceAnnotationAction
{
    /**
     * @param  array<int, string>|null  $highlights
     */
    public function execute(
        User $user,
        LearningResource $resource,
        bool $isBookmarked,
        ?array $highlights,
        ?string $personalNoteMarkdown,
    ): StudentResourceAnnotation {
        if ($user->account_type !== AccountType::Student) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_STUDENT_ONLY',
                message: 'শুধুমাত্র শিক্ষার্থীরা ব্যক্তিগত নোট ও বুকমার্ক সংরক্ষণ করতে পারবে।',
                httpStatus: 403,
            );
        }

        $user->loadMissing('studentProfile');
        $studentProfile = $user->studentProfile;

        if ($studentProfile === null) {
            throw new DomainException(
                errorCode: 'STUDENT_PROFILE_NOT_FOUND',
                message: 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        /** @var StudentResourceAnnotation $annotation */
        $annotation = StudentResourceAnnotation::query()->updateOrCreate(
            [
                'student_id' => $studentProfile->id,
                'learning_resource_id' => $resource->id,
            ],
            [
                'is_bookmarked' => $isBookmarked,
                'highlights_json' => $highlights,
                'personal_note_markdown' => $personalNoteMarkdown,
            ],
        );

        return $annotation;
    }
}
