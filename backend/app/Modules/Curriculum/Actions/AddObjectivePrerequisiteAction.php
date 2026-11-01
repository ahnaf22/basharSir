<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Actions;

use App\Core\Exceptions\DomainException;
use App\Modules\Curriculum\Domain\PrerequisiteDagValidator;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\ObjectivePrerequisite;

final readonly class AddObjectivePrerequisiteAction
{
    public function __construct(
        private PrerequisiteDagValidator $dagValidator,
    ) {}

    public function execute(
        LearningObjective $objective,
        int $prerequisiteObjectiveId,
        bool $isStrict = true,
    ): ObjectivePrerequisite {
        /** @var LearningObjective|null $prerequisite */
        $prerequisite = LearningObjective::query()->find($prerequisiteObjectiveId);

        if ($prerequisite === null) {
            throw new DomainException(
                errorCode: 'PREREQUISITE_OBJECTIVE_NOT_FOUND',
                message: 'পূর্বশর্ত শিখনফলটি খুঁজে পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        $this->dagValidator->assertNoCycle($objective->id, $prerequisite->id);

        /** @var ObjectivePrerequisite $edge */
        $edge = ObjectivePrerequisite::query()->updateOrCreate(
            [
                'learning_objective_id' => $objective->id,
                'prerequisite_objective_id' => $prerequisite->id,
            ],
            [
                'is_strict' => $isStrict,
            ],
        );

        return $edge;
    }
}
