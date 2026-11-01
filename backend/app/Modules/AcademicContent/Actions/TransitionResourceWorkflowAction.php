<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\AcademicContent\Jobs\IndexPublishedResourceJob;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\Identity\Domain\Enums\AccountType;

final readonly class TransitionResourceWorkflowAction
{
    public function execute(
        User $actor,
        LearningResource $resource,
        ResourceWorkflowStatus $targetStatus,
    ): LearningResource {
        if ($actor->account_type !== AccountType::Admin && $actor->account_type !== AccountType::Reviewer) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_REVIEWER_ONLY',
                message: 'শুধুমাত্র অ্যাডমিন অথবা কনটেন্ট রিভিউয়ার পাঠ্য উপকরণের অবস্থা পরিবর্তন করতে পারবেন।',
                httpStatus: 403,
            );
        }

        $currentStatus = $resource->workflow_status;

        if (! $currentStatus->canTransitionTo($targetStatus)) {
            throw new DomainException(
                errorCode: 'INVALID_RESOURCE_WORKFLOW_TRANSITION',
                message: sprintf(
                    'পাঠ্য উপকরণ সরাসরি "%s" থেকে "%s" অবস্থায় পরিবর্তন করা অনুমোদিত নয়। (Draft -> In Review -> Approved -> Published ক্রম অনুসরণ করুন)',
                    $currentStatus->value,
                    $targetStatus->value,
                ),
                httpStatus: 422,
                details: [
                    'current_status' => $currentStatus->value,
                    'target_status' => $targetStatus->value,
                ],
            );
        }

        $updates = [
            'workflow_status' => $targetStatus,
        ];

        if ($targetStatus === ResourceWorkflowStatus::Approved) {
            $updates['reviewed_by'] = $actor->id;
            $updates['reviewed_at'] = now();
        }

        if ($targetStatus === ResourceWorkflowStatus::Published) {
            $updates['published_at'] = now();
        }

        $resource->update($updates);

        if ($targetStatus === ResourceWorkflowStatus::Published) {
            IndexPublishedResourceJob::dispatchSync($resource->id);
            $resource->refresh();
        }

        return $resource;
    }
}
