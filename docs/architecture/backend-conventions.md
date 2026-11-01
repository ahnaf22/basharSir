# Laravel Backend Architecture & Coding Conventions

This document defines the mandatory directory structure, request lifecycle, domain module boundaries, and engineering standards for the **Laravel (`backend/`)** modular monolith.

---

## 1. Request Lifecycle & Layer Responsibilities

Every HTTP request or CLI/Queue job must flow through a strict, unidirectional layered architecture:

```text
HTTP Request
   │
   ▼
FormRequest (Validation + Input Sanitization + Route/Policy Pre-check)
   │
   ▼
Controller (Thin HTTP adapter: extracts DTO, calls Service/Action, returns ApiResource)
   │
   ▼
Application Service / Action (Orchestrates use case, DB transactions, dispatches Events/Jobs)
   │
   ▼
Domain Logic / State Machine / Calculator (Pure business rules, e.g., MasteryCalculator, TutorStateMachine)
   │
   ▼
Repository [When Justified] (Complex multi-table queries, caching, or external index lookups)
   │
   ▼
Eloquent Model / MySQL
```

### Layer Rules
| Layer | Allowed Responsibilities | Strictly Forbidden |
| :--- | :--- | :--- |
| **FormRequests** | Field validation rules, custom Bangla/English validation messages, `toDto()` helper. | Business logic, database writes, external API calls. |
| **Controllers** | Invoking a single Action/Service method, returning `JsonResource` with HTTP status code. | `DB::` queries, `Http::` calls, AI calls, loops, business conditionals. |
| **Actions / Services** | `DB::transaction()`, coordinating domain classes, dispatching queued Jobs and Domain Events. | Returning `JsonResponse` or reading `request()` globals directly. |
| **Domain Classes** | Pure business state machines, rubric scoring calculation, mastery formulas, study plan math. | Direct HTTP/Controller awareness. |
| **Repositories** | Introduced **only** when encapsulating complex query builders, hybrid RAG lookups, or replaceable storage. | Creating boilerplate 1-to-1 pass-through wrappers for trivial `Model::find()` calls. |
| **API Resources** | Transforming Models/DTOs into standardized `/api/v1` JSON envelopes. | Triggering lazy-loaded N+1 queries (always use `whenLoaded()`). |

---

## 2. Backend Module Directory Structure

All 20 domain modules live under `backend/app/Modules/` (or `app/Domains/`) with explicit internal structure:

```text
backend/
├── app/
│   ├── Core/                           # Shared kernel utilities, base classes, middleware, exceptions
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Resources/
│   │   ├── Support/
│   │   └── Exceptions/
│   ├── Modules/
│   │   ├── Identity/                   # Auth, OTP, Users, Roles, Permissions
│   │   ├── Guardians/                  # Guardian profiles, student linking, PDPA 2026 ConsentRecords
│   │   ├── Students/                   # Student profiles, class/curriculum enrollments
│   │   ├── Curriculum/                 # AcademicYear, CurriculumVersion, Class, Subject, Chapter, Topic, LearningObjective
│   │   ├── AcademicContent/            # Lesson notes, worked examples, diagrams, review workflow
│   │   ├── Tutoring/                   # TutorSession state machine, turn handling, session summaries
│   │   ├── StudyPlanner/               # StudyPlan generator, adaptive rescheduling, remedial queue
│   │   ├── QuestionBank/               # Questions, MCQ options, creative stems, MarkingRubrics
│   │   ├── Examinations/               # Exam generation, live attempts, autosave, timer enforcement
│   │   ├── Evaluation/                 # Objective grader, AI rubric evaluator, handwritten OCR pipeline
│   │   ├── LearningAnalytics/          # MasteryCalculationService, topic progress, parent reports
│   │   ├── Calendar/                   # LearningTasks, active study heartbeat logs, daily summaries
│   │   ├── Gamification/               # XP points, streaks, badges, cohort leaderboards
│   │   ├── GroupLearning/              # StudyGroups, Reverb presence sessions, RaiseHand queue
│   │   ├── Notifications/              # Push (FCM), BD SMS gateway, in-app notifications
│   │   ├── Subscriptions/              # SubscriptionPlans, active entitlements, quota checks
│   │   ├── Payments/                   # bKash, Nagad, SSLCommerz adapters, webhook handlers
│   │   ├── TeacherMarketplace/         # Phase 6: Teacher profiles, packages, bookings
│   │   ├── Administration/             # Admin audit logs, content moderation, system configs
│   │   └── AI/                         # AIOrchestrator, RAG retriever, PromptRegistry, UsageLedger
```

### Anatomy of a Single Module (e.g., `app/Modules/Tutoring/`)
```text
app/Modules/Tutoring/
├── Actions/
│   ├── StartTutorSessionAction.php
│   ├── ProcessStudentTurnAction.php
│   └── CompleteTutorSessionAction.php
├── Controllers/
│   └── V1/
│       └── TutorSessionController.php
├── DTOs/
│   ├── StartSessionData.php
│   └── StudentTurnData.php
├── Domain/
│   ├── TutorStateMachine.php
│   └── Enums/
│       └── LessonStage.php
├── Events/
│   ├── TutorTurnCompleted.php
│   └── LessonObjectiveMastered.php
├── Jobs/
│   └── SummarizeTutorSessionJob.php
├── Models/
│   ├── TutorSession.php
│   └── TutorMessage.php
├── Policies/
│   └── TutorSessionPolicy.php
├── Requests/
│   ├── StartTutorSessionRequest.php
│   └── SubmitStudentTurnRequest.php
└── Resources/
    ├── TutorSessionResource.php
    └── TutorMessageResource.php
```

---

## 3. Mandatory Laravel Coding Standards

1. **Strict Types & Type Hints**:
   - Every PHP file must begin with `declare(strict_types=1);`.
   - All method parameters, return types, and class properties must be explicitly typed. Use PHP 8.2+ `readonly` classes for DTOs and Actions where applicable.

2. **Preventing N+1 & Performance Issues**:
   - Enable `Model::preventLazyLoading(! app()->isProduction());` in `AppServiceProvider`.
   - Enable `Model::preventSilentlyDiscardingAttributes(! app()->isProduction());`.

3. **Authorization via Policies**:
   - Every controller method accessing student-specific resources (`StudyPlan`, `TutorSession`, `ExamAttempt`, `Evaluation`, `PerformanceReport`) must call `$this->authorize('view', $model)`.
   - Policies must verify that either:
     - `$user->id === $student->user_id`, OR
     - `$user->isGuardianOf($student->id)` with an active `ConsentRecord`, OR
     - `$user->hasRole(['admin', 'content_reviewer'])` (where permitted by PDPA audit rules).

4. **Idempotency & Concurrency Locks**:
   - Sensitive state transitions (submitting an exam attempt, processing a tutor turn, handling a bKash/Nagad/SSLCommerz webhook) must acquire an atomic Redis lock:
     ```php
     Cache::lock("tutor-session:{$session->id}:turn", 10)->block(5, function () {
         // Execute state transition & persist turn inside DB::transaction()
     });
     ```

5. **No Direct AI Provider Calls Outside `Modules/AI`**:
   - Domain modules never import OpenAI, Gemini, or Anthropic SDKs directly. They type-hint contracts from `App\Modules\AI\Contracts\` (e.g., `TutorAiServiceInterface`, `RubricEvaluatorInterface`) which are resolved through the central `AIOrchestrator`.

---

## 4. Automated Testing & Quality Tooling

Every PR / vertical slice must pass:
1. **Formatting**: `./vendor/bin/pint --test` (PSR-12 + Laravel preset).
2. **Static Analysis**: `./vendor/bin/phpstan analyse --memory-limit=2G` (Level 8 target).
3. **Automated Tests (`Pest PHP`)**:
   - **Unit Tests (`tests/Unit/`)**: Test pure domain classes (`TutorStateMachine`, `MasteryCalculator`, `StudyPlanGenerator`, `DeterministicObjectiveGrader`) with zero external network calls.
   - **Feature Tests (`tests/Feature/Api/V1/`)**: Test full HTTP endpoints, FormRequest validation failures, cross-student authorization denial (`403 Forbidden`), idempotency, and database state assertions using `Http::fake()` / mocked AI providers.
   - **Architecture Tests (`tests/ArchTest.php`)**: Pest architecture rules enforcing `strict_types`, no `dd()`/`dump()`, controllers only calling Actions/Services, and no direct AI SDK usage outside `App\Modules\AI`.

