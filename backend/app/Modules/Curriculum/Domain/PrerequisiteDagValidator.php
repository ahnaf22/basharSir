<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Domain;

use App\Core\Exceptions\DomainException;
use App\Modules\Curriculum\Models\ObjectivePrerequisite;

final class PrerequisiteDagValidator
{
    /**
     * Validates that adding a directed dependency edge ($objectiveId -> $prerequisiteId)
     * preserves a strict Directed Acyclic Graph (DAG) with zero cycles.
     */
    public function assertNoCycle(int $objectiveId, int $prerequisiteId): void
    {
        if ($objectiveId === $prerequisiteId) {
            throw new DomainException(
                errorCode: 'PREREQUISITE_CYCLE_DETECTED',
                message: 'একটি শিখনফল (Learning Objective) নিজের পূর্বশর্ত (Prerequisite) হতে পারে না।',
                httpStatus: 422,
            );
        }

        // BFS from $prerequisiteId to check if $objectiveId is reachable
        $visited = [];
        $queue = [$prerequisiteId];

        while ($queue !== []) {
            $currentId = array_shift($queue);

            if ($currentId === $objectiveId) {
                throw new DomainException(
                    errorCode: 'PREREQUISITE_CYCLE_DETECTED',
                    message: 'এই পূর্বশর্তটি যুক্ত করলে শিখনফলের গ্রাফে চক্রাকার নির্ভরতা (DAG Cycle) তৈরি হবে।',
                    httpStatus: 422,
                    details: [
                        'learning_objective_id' => $objectiveId,
                        'prerequisite_objective_id' => $prerequisiteId,
                    ],
                );
            }

            if (isset($visited[$currentId])) {
                continue;
            }
            $visited[$currentId] = true;

            /** @var array<int, int> $nextPrerequisites */
            $nextPrerequisites = ObjectivePrerequisite::query()
                ->where('learning_objective_id', $currentId)
                ->pluck('prerequisite_objective_id')
                ->map(static fn (mixed $id): int => (int) $id)
                ->all();

            foreach ($nextPrerequisites as $nextId) {
                if (! isset($visited[$nextId])) {
                    $queue[] = $nextId;
                }
            }
        }
    }
}
