<?php

declare(strict_types=1);

arch('all app files use strict types')
    ->expect('App')
    ->toUseStrictTypes();

arch('debugging functions are not used in application code')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->each->not->toBeUsed();

arch('controllers reside in V1 namespace or base Controller')
    ->expect('App\Core\Http\Controllers\V1')
    ->toExtend('App\Http\Controllers\Controller');

arch('domain modules exist for all 20 bounded contexts')
    ->expect(fn (): bool => collect([
        'Identity', 'Guardians', 'Students', 'Curriculum', 'AcademicContent',
        'Tutoring', 'StudyPlanner', 'QuestionBank', 'Examinations', 'Evaluation',
        'LearningAnalytics', 'Calendar', 'Gamification', 'GroupLearning',
        'Notifications', 'Subscriptions', 'Payments', 'TeacherMarketplace',
        'Administration', 'AI',
    ])->every(fn (string $module): bool => is_dir(base_path("app/Modules/{$module}"))))
    ->toBeTrue();
