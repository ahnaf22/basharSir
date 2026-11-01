# AGENTS.md — Global Engineering Rules & Agent Instructions

This file defines the mandatory architectural invariants, coding standards, and workflow rules for all AI agents and human engineers working on **AI Home Tutor Bangladesh (`home-tutor-platform`)**.

---

## 1. Core Architectural Invariants (Non-Negotiable)

1. **Curriculum-First, Never AI-First**:
   - The AI model must **never** rely on ungrounded general training knowledge to teach, generate exams, or grade answers.
   - Every lesson, tutoring session, study plan, practice question, examination, evaluation, and mastery record **must** be linked to a specific `curriculum_version_id`, `class_id`, `subject_id`, `chapter_id`, `topic_id`, and `learning_objective_id` based on official NCTB (National Curriculum and Textbook Board) structures.
   - Historical curriculum versions must be immutable once published and linked to student records. Never overwrite or destructively mutate an active curriculum version.

2. **Evidence-Based Mastery Separation**:
   - Completing a conversation or reading lesson notes **never** marks a topic or learning objective as mastered.
   - Mastery scores are calculated deterministically by the backend `MasteryCalculationService` based on verified assessment evidence (prerequisite checks, guided practice, mini-assessments, and examinations), difficulty weights, hint penalties, and recency.
   - An LLM response can never directly mark a chapter or objective as completed without the backend state machine verifying assessment criteria.

3. **Stateful Tutoring Engine with Strict Structured Output**:
   - The AI Tutor is a finite-state pedagogical engine (`START_LESSON` → `CHECK_PREREQUISITES` → `TEACH_PREREQUISITE` → `EXPLAIN_CONCEPT` → `WORKED_EXAMPLE` → `ASK_STUDENT_QUESTION` → `IDENTIFY_MISCONCEPTION` / `INCREASE_DIFFICULTY` → `MINI_ASSESSMENT` → `SAVE_PROGRESS`), **not** an open-ended chatbot.
   - Every AI Tutor response must conform to a strict JSON schema validated by the backend before rendering or transitioning state.

4. **Rubric-Bound Evaluation**:
   - Never allow an LLM to assign marks arbitrarily.
   - Objective questions (MCQ, True/False, Fill-in-the-blank, exact numeric) must be evaluated deterministically in code.
   - Written, creative (*সৃজনশীল*), and handwritten answers must be evaluated against a structured `MarkingRubric` (step-wise marks, required points, accepted alternatives, common mistakes) with an explicit confidence score and provisional/human-review fallback.

5. **Child Protection & Bangladesh PDPA 2026 Compliance**:
   - All student accounts (under 18) require verifiable parent/guardian linking and explicit `ConsentRecord` tracking in accordance with Bangladesh's **Personal Data Protection Act, 2026 (Act No. 63 of 2026)**.
   - Student data must be strictly scoped (`student_id` + guardian ownership policy). No student may ever view another student's profile, scripts, or reports.
   - PII must be stripped/pseudonymized before sending prompts to external AI providers, and every AI call must be logged in `ai_requests` and `ai_usage_logs`.

6. **Modular Monolith Boundaries**:
   - The backend is a single Laravel modular monolith organized by domain modules (`Identity`, `Guardians`, `Students`, `Curriculum`, `AcademicContent`, `Tutoring`, `StudyPlanner`, `QuestionBank`, `Examinations`, `Evaluation`, `LearningAnalytics`, `Calendar`, `Gamification`, `GroupLearning`, `Notifications`, `Subscriptions`, `Payments`, `TeacherMarketplace`, `Administration`, `AI`).
   - Next.js (`apps/web`) and Flutter (`apps/mobile`) are completely independent clients consuming the versioned `/api/v1/*` REST API via OpenAPI contracts. Never share React code with Flutter or duplicate backend business rules in frontend clients.

---

## 2. Mandatory Coding Standards

### 2.1 Laravel Backend (`backend/`)
- **Layered Flow**: `FormRequest` → `Controller` (thin) → `Application Service / Action` → `Domain Logic` → `Repository` (only when complex querying or abstraction is justified) → `Eloquent Model`.
- **Validation & Auth**: Every write/query endpoint must use a dedicated `FormRequest` and authorize via Laravel `Policies` / `Gates`.
- **Database Integrity**: Wrap all multi-step writes in `DB::transaction()`. Enforce eager loading (`with()`) to prevent N+1 queries.
- **API Responses**: Always return `JsonResource` / `ResourceCollection` envelopes. Never return raw Eloquent models from controllers.
- **No Direct AI Calls in Controllers**: All AI interactions must go through the `AIOrchestrator` and domain-specific AI service interfaces (`TutorProviderInterface`, `EvaluationProviderInterface`, etc.).
- **Idempotency**: Payment webhooks (bKash, Nagad, SSLCommerz), exam submissions, and AI generation triggers must enforce idempotency keys via Redis locks.
- **Quality Gates**: Code must pass `Laravel Pint` (formatting), `PHPStan / Larastan` (static analysis), and `Pest` (unit, feature, and integration tests).

### 2.2 Next.js Web (`apps/web/`)
- **Stack**: Next.js App Router, TypeScript (`strict: true`), Tailwind CSS, TanStack Query, React Hook Form + Zod.
- **Feature-First Organization**: Group components, hooks, API functions, types, and schemas under `src/features/<feature-name>/`.
- **API Client**: Centralize all HTTP calls in `src/services/api-client.ts` using types generated from the OpenAPI spec. Never call raw `fetch()` inside UI components.
- **Design & Typography**: Follow [`docs/design-system/design-principles.md`](./docs/design-system/design-principles.md). Use `Noto Sans Bengali` / `Hind Siliguri` paired with `Inter` / `Plus Jakarta Sans` and KaTeX for math. Never build a generic ChatGPT-style chat window for the AI Tutor; use the 3-pane academic learning workspace.

### 2.3 Flutter Mobile (`apps/mobile/`)
- **Stack**: Flutter, Dart, Riverpod (`riverpod_annotation`), GoRouter, Dio, Drift/Isar or Hive for offline local storage.
- **Feature-First Organization**: Place domain, data, and presentation layers inside `lib/features/<feature_name>/`.
- **Bangladesh Network Resilience**: Support offline access for downloaded chapter notes, local draft persistence for exam/practice answers, automatic sync on reconnection, and background chunked/retryable uploads for photographed handwritten answer scripts.

---

## 3. Agent Workflow & Change Protocol

1. **Read Relevant Docs Before Coding**:
   - Before implementing any feature, read the corresponding specification in `docs/` (see [`README.md`](./README.md) for the full index).
2. **Work in Vertical Slices**:
   - Deliver complete, working vertical slices (Migration + Model + Service + API Endpoint + OpenAPI Spec + Tests + UI Integration).
   - **No Mockups Masquerading as Features**: Do not hardcode fake arrays in frontend components or return dummy static JSON from controllers unless explicitly scaffolded as a documented test fixture.
3. **Never Silently Alter Architecture**:
   - If a feature requires changing an existing database relationship, state machine transition, API contract, or module boundary, you **must**:
     1. Explain the reason clearly.
     2. Update the relevant specification in `docs/`.
     3. Update or add automated tests covering the change.
4. **Definition of Done (DoD) for Every Chunk**:
   - Database migrations are reversible and indexed.
   - Student/guardian authorization policies are enforced and tested for cross-tenant isolation.
   - API endpoints match [`docs/api/api-conventions.md`](./docs/api/api-conventions.md).
   - Automated tests (`Pest` on backend, `Vitest`/`Playwright` on web, `flutter test` on mobile) pass natively (no Docker required).
   - Documentation in `docs/` reflects any newly added endpoints, tables, or workflows.
   - [`progress.md`](./progress.md) is updated immediately upon completing a chunk to reflect the current status and percentage.

