# Development Roadmap & Granular Phase-Chunk Backlog

This document defines the **6-Phase Release Roadmap** (without Docker — running natively on local PHP/Laravel, MySQL, Redis/Cache, Node.js, and Flutter) and breaks every phase down into **small, atomic, verifiable implementation chunks**.

Track live implementation status in [`progress.md`](../../progress.md).

---

## 1. Local Development Environment (No Docker)

All services run directly on the host machine for fast, zero-container iteration:
- **Backend (`backend/`)**: PHP 8.2+, Composer, Laravel 11+ (`php artisan serve`, `php artisan queue:work`, `php artisan reverb:start`).
- **Database**: Local MySQL 8.0+ (`utf8mb4_unicode_ci`) for development/production, with SQLite / MySQL test database support for fast `Pest` test runs.
- **Cache, Locks & Queues**: Local Redis server (or Laravel `database` / `file` driver fallback on Windows when Redis is not running locally).
- **Storage**: Local filesystem disk (`storage/app/public` and `storage/app/private` with signed temporary URLs) in local dev; S3-compatible object storage in staging/production.
- **Web (`apps/web/`)**: Node.js 20+ (`npm` / `pnpm`), Next.js 15+ App Router (`npm run dev`).
- **Mobile (`apps/mobile/`)**: Flutter SDK 3.24+ & Dart 3+ (`flutter run`).

---

## 2. Six-Phase Product Rollout Overview

| Phase | Milestone Name | Total Chunks | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Product Discovery & Academic Foundation** | 4 Chunks (`0.1` – `0.4`) | Completed |
| **Phase 1** | **Core Platform, Identity & Curriculum CMS Foundation** | 8 Chunks (`1.1` – `1.8`) | Pending |
| **Phase 2** | **AI Tutoring Engine & Personalized Study Planner (Core MVP)** | 8 Chunks (`2.1` – `2.8`) | Pending |
| **Phase 3** | **Examinations, Rubric Evaluation, Analytics & BD Billing** | 8 Chunks (`3.1` – `3.8`) | Pending |
| **Phase 4** | **Flutter Mobile Application & Offline Resilience** | 6 Chunks (`4.1` – `4.6`) | Pending |
| **Phase 5** | **Handwritten Script OCR, Group Study & Gamification** | 5 Chunks (`5.1` – `5.5`) | Pending |
| **Phase 6** | **Human Teacher Marketplace & Class 1–10 Expansion** | 4 Chunks (`6.1` – `6.4`) | Pending |

---

## 3. Granular Phase & Chunk Breakdown

### Phase 0 — Product Discovery & Academic Foundation *(Completed)*
- **Chunk 0.1 — Governance & Product Specifications**: `README.md`, `AGENTS.md`, `docs/product/product-brief.md`, `docs/product/feature-specifications.md`.
- **Chunk 0.2 — Architecture & Client Conventions**: `system-architecture.md`, `backend-conventions.md`, `frontend-conventions.md`, `mobile-conventions.md`.
- **Chunk 0.3 — Database ERD & REST API Contracts**: `database-design.md`, `api-conventions.md`.
- **Chunk 0.4 — AI Pedagogical Engine, Safety & Design System**: `ai-tutoring-engine.md`, `ai-safety-and-evaluation.md`, `design-principles.md`, `development-roadmap.md`, `progress.md`.

---

### Phase 1 — Core Platform, Identity & Curriculum CMS Foundation

#### Chunk 1.1 — Laravel Backend Initialization & Modular Structure
- **Scope**: Initialize `backend/` (Laravel 11+), create the 20 domain module folders under `app/Modules/*`, configure standard JSON response envelopes (`ApiResponse`), `/api/v1/health` endpoint, `Laravel Pint`, `Larastan`, and `Pest` architecture test (`ArchTest.php`).
- **Verification**: `php artisan test` and `./vendor/bin/pint --test` pass.

#### Chunk 1.2 — Next.js Web Initialization & Bangla/Math Design System
- **Scope**: Initialize `apps/web/` (Next.js App Router + TypeScript strict + Tailwind CSS), configure `Hind Siliguri`, `Noto Sans Bengali`, `Plus Jakarta Sans`, and `KaTeX` fonts, set up Academic Navy (`#0F2942`) & Muted Teal (`#0D9488`) design tokens, `<MathBanglaText />` primitive, and centralized `api-client.ts`.
- **Verification**: `npm run build` and `npm run typecheck` pass.

#### Chunk 1.3 — Identity, Student/Guardian Profiles & BD SMS OTP Backend
- **Scope**: Migrations, models, and services for `users`, `student_profiles`, `guardian_profiles`, and OTP verification (`SmsGatewayInterface` + local log/mock driver). Endpoints: `POST /api/v1/auth/register/student`, `POST /api/v1/auth/register/guardian`, `POST /api/v1/auth/otp/send`, `POST /api/v1/auth/otp/verify`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`.
- **Verification**: Pest feature tests for registration, login, and OTP rate-limiting.

#### Chunk 1.4 — PDPA 2026 Guardian Linking & Child Consent Backend
- **Scope**: Migrations and policies for `student_guardian_links` and `consent_records` (`Act No. 63 of 2026`). Enforce `StudentOwnershipPolicy` and middleware blocking AI/exam features for unconsented minors. Endpoints: `GET /api/v1/guardians/children`, `POST /api/v1/guardians/children/link`, `POST /api/v1/guardians/consent/approve`, `POST /api/v1/guardians/consent/revoke`.
- **Verification**: Pest tests verifying cross-student `403` isolation and guardian consent gates.

#### Chunk 1.5 — Auth, Onboarding & Guardian Consent Web UI (`apps/web`)
- **Scope**: Student & Guardian Registration/Login screens, 6-digit BD SMS OTP modal, Student Onboarding (Class 6–8 & Bangla Medium selector), Guardian Consent approval screen, and Parent Child-Switcher header.
- **Verification**: End-to-end auth flow against `/api/v1/auth/*` and `/api/v1/guardians/*`.

#### Chunk 1.6 — Versioned NCTB Curriculum Engine & Seed Data (Backend)
- **Scope**: Migrations & models for `academic_years`, `curriculum_versions`, `classes`, `subjects`, `chapters`, `topics`, `learning_objectives`, and `objective_prerequisites`. Enforce published version immutability and prerequisite DAG cycle detection. Seed NCTB 2026 Class 6–8 Bangla Medium **Mathematics** (*গণিত*) and **Science** (*বিজ্ঞান*) curriculum trees.
- **Verification**: Pest tests for curriculum tree queries, version immutability, and DAG validation.

#### Chunk 1.7 — Academic Content CMS, Approval Workflow & Hybrid RAG Indexer (Backend)
- **Scope**: Migrations & models for `learning_resources` (`lesson_note`, `summary`, `definition`, `worked_example`, `diagram`, `formula_sheet`). Implement `Draft` → `In Review` → `Approved` → `Published` state transitions, MySQL Full-Text + Vector chunk indexing job (`IndexPublishedResourceJob`), and watermarked PDF export endpoint (`GET /api/v1/resources/{id}/pdf`).
- **Verification**: Pest tests for reviewer approval guards and RAG chunk retrieval scoped by `learning_objective_id`.

#### Chunk 1.8 — Admin Curriculum CMS & Student Study Materials Reader (Web UI)
- **Scope**: Admin Curriculum Tree Manager & Markdown/KaTeX Content Editor (`src/features/admin-curriculum/`) + Student Subject/Chapter Explorer and Study Materials Reader (`src/features/curriculum/`) with bookmarks, highlights, personal notes, and PDF download.
- **Verification**: Web build & component tests for Bangla + KaTeX rendering and resource navigation.

---

### Phase 2 — AI Tutoring Engine & Personalized Study Planner (Core MVP)

#### Chunk 2.1 — AI Orchestrator, PII Scrubber & Token Usage Ledger
- **Scope**: Migrations for `ai_requests` and `usage_ledger`. Implement `AIOrchestrator`, `PiiScrubberService` (PDPA 2026 compliance), pluggable provider adapters (`OpenAI`, `Gemini`, `Anthropic`, plus deterministic test double), and token/cost logging.
- **Verification**: Pest unit tests for PII redaction, provider fallback, and ledger recording.

#### Chunk 2.2 — Stateful 13-Stage AI Tutoring State Machine & RAG Retriever
- **Scope**: Migrations for `tutor_sessions` and `tutor_messages`. Implement `TutorStateMachine` (`START_LESSON` through `COMPLETED`), `AcademicRagRetriever` (`< 3,500` token context budget), and strict `TutorResponseSchema` JSON validator.
- **Verification**: Pest tests for all 13 state transitions, premature completion blocking, and schema retry/fallback.

#### Chunk 2.3 — Evidence-Based Mastery Calculation Service & Tutor API Endpoints
- **Scope**: Migrations for `mastery_records` and `mastery_evidence_logs`. Implement `MasteryCalculationService` (weighted evidence formula, difficulty multiplier, hint penalties, recency decay) and Tutor REST endpoints (`POST /api/v1/tutor-sessions`, `GET /api/v1/tutor-sessions/{id}`, idempotent `POST /api/v1/tutor-sessions/{id}/turns`, `/pause`, `/flag`).
- **Verification**: Pest tests verifying that chatting never marks mastery without passing `MINI_ASSESSMENT`, and verifying exact hint penalty math.

#### Chunk 2.4 — 3-Pane AI Private Tutor Workspace — Left & Center Panes (Web UI)
- **Scope**: Build the Left Pane (7-step lesson progression rail, prerequisite status, objective mastery bar) and Center Pane (NCTB Concept & Worked Example canvas with `<MathBanglaText />`, interactive question card, math input toolbar, and progressive 3-level Hint drawer).
- **Verification**: UI tests for step transitions, KaTeX rendering, and progressive hint unlocking.

#### Chunk 2.5 — 3-Pane AI Private Tutor Workspace — Right Pane & Pedagogical Controls (Web UI)
- **Scope**: Build the Right Pane (contextual tutor dialogue + 1-click Bangla pedagogical action buttons: *"আরেকটু সহজ করে বোঝাও"*, *"আরেকটি উদাহরণ দাও"*, *"ইঙ্গিত দাও"*, *"আগের অংশে ফিরে যাও"*), session pause/resume, and Post-Lesson Summary Card.
- **Verification**: Full end-to-end tutoring session flow on Web.

#### Chunk 2.6 — Personalized Study Planner Engine & Adaptive Rescheduler (Backend)
- **Scope**: Migrations for `study_plans` and `study_plan_items`. Implement `StudyPlanGeneratorService` (calculating daily tasks from selected chapters, prerequisite gaps, mastery scores, target exam date, and daily study minutes) and adaptive rescheduling hooks when a student struggles or misses a task.
- **Verification**: Pest tests for initial plan generation and dynamic workload rebalancing.

#### Chunk 2.7 — Active Study Time Heartbeat Tracker & Calendar API (Backend)
- **Scope**: Migration for `study_time_logs`. Implement `HeartbeatIngestionAction` (`POST /api/v1/analytics/study-heartbeat`, 30s active ping, 120s idle cutoff) and Calendar endpoints (`GET /api/v1/calendar`, `PATCH /api/v1/study-plan-items/{id}/reschedule`).
- **Verification**: Pest tests verifying idle time exclusion and accurate daily active study minute aggregation.

#### Chunk 2.8 — Study Planner Wizard, Learning Calendar & Heartbeat Hook (Web UI)
- **Scope**: Build the Study Plan Creation Wizard, Daily/Weekly/Monthly Learning Calendar (`src/features/study-planner/`), drag/click task rescheduler, and `useActiveStudyHeartbeat` hook.
- **Verification**: Web build & integration tests for study plan creation and calendar views.

---

### Phase 3 — Examinations, Rubric Evaluation, Analytics & BD Billing

#### Chunk 3.1 — Question Bank, Marking Rubrics & Exam Blueprint Engine (Backend)
- **Scope**: Migrations for `questions`, `marking_rubrics`, and `exams`. Support MCQ, Multiple-Statement MCQ (*বহুপদী সমাপ্তিসূচক*), True/False, Fill-in-the-blank, Short Answer, Creative Question (*সৃজনশীল ক, খ, গ, ঘ*), and Math Problem types. Implement `ExamGeneratorService`.
- **Verification**: Seed Class 6–8 Math & Science question banks with structured rubrics; Pest tests for blueprint generation.

#### Chunk 3.2 — Timed Exam Attempt Lifecycle & Deterministic Objective Grader (Backend)
- **Scope**: Migrations for `exam_attempts` and `submitted_answers`. Implement server-authoritative timer validation, batch answer autosave (`PUT /api/v1/exam-attempts/{id}/answers`), idempotent submission (`POST /api/v1/exam-attempts/{id}/submit`), and `DeterministicObjectiveGrader`.
- **Verification**: Pest tests for late-submission grace window, duplicate submit idempotency, and instant MCQ grading.

#### Chunk 3.3 — Rubric-Based Written/Creative AI Evaluator & Review Queue (Backend)
- **Scope**: Migration for `evaluations`. Implement `AnswerEvaluatorService` & queued `EvaluateSubmittedAnswerJob` for grading typed short and creative (*সৃজনশীল*) answers against `MarkingRubric` JSON, enforcing `confidence_score >= 0.80` or routing to `provisional_pending_review`, and feeding verified exam evidence into `MasteryCalculationService`.
- **Verification**: Pest tests for step-wise rubric mark clamping, confidence threshold escalation, and mastery recalculation.

#### Chunk 3.4 — Timed Examination Runner & Rubric Result Breakdown (Web UI)
- **Scope**: Distraction-free Timed Exam Runner (`src/features/examinations/` — server-synced countdown, question palette, flag-for-review, `localStorage` offline autosave) and Exam Result Breakdown screen showing step-by-step rubric feedback and NCTB textbook references.
- **Verification**: Web build & exam runner interaction tests.

#### Chunk 3.5 — 5-Tier Student Performance Analytics & Weekly Parent Report Engine (Backend)
- **Scope**: Implement `LearningAnalyticsService` (Overall Snapshot, Subject Matrix, Topic/Objective Weakness Detector, Actionable Bangla Recommendations, Week-over-Week Trends) and `GenerateWeeklyParentReportsJob` + downloadable PDF report card.
- **Verification**: Pest tests for weakness detection accuracy and parent report generation.

#### Chunk 3.6 — Student Performance Dashboard & Dedicated Parent Portal (Web UI)
- **Scope**: Student Analytics Dashboard (`src/features/analytics/`) and Dedicated Parent Portal (`src/features/parent-portal/` — child switcher, weekly study consistency chart, weak-topic radar, exam history, and PDF report download).
- **Verification**: Web build & parent role access control verification.

#### Chunk 3.7 — Subscriptions, Usage Quotas & BD Payment Gateways (Backend)
- **Scope**: Migrations for `subscription_plans`, `subscriptions`, and `payments`. Implement `PaymentGatewayInterface` with `BkashGateway`, `NagadGateway`, and `SslCommerzGateway` adapters, signed webhook handlers with Redis/Cache idempotency locks, and `SubscriptionQuotaMiddleware`.
- **Verification**: Pest tests for webhook signature verification, idempotent double-webhook handling, and daily AI turn quota enforcement.

#### Chunk 3.8 — Guardian Subscription Checkout & Billing Portal (Web UI)
- **Scope**: Plan comparison page (`Free`, `Basic`, `Premium`, `Family`), bKash/Nagad/SSLCommerz checkout flow, payment callback status pages, usage quota meters, and invoice history.
- **Verification**: End-to-end sandbox checkout flow test.

---

### Phase 4 — Flutter Mobile Application & Offline Resilience

#### Chunk 4.1 — Flutter App Initialization, Design System & Dio API Client
- **Scope**: Initialize `apps/mobile/` (Flutter + Riverpod + GoRouter + Dio + Drift SQLite), Bangla (`Hind Siliguri`) + math rendering widgets, and auth token/idempotency interceptors.
- **Verification**: `flutter analyze` and `flutter test` pass.

#### Chunk 4.2 — Mobile Auth, OTP, Onboarding & Parent Child-Switcher
- **Scope**: Mobile screens for Student/Guardian login, BD SMS OTP verification, PDPA consent approval, and profile switching.
- **Verification**: Widget tests for mobile auth and onboarding flows.

#### Chunk 4.3 — Mobile Curriculum Browser & Offline SQLite Study Materials Reader
- **Scope**: Subject/Chapter browser and Drift SQLite offline caching for lesson notes, formula sheets, and worked examples on low-bandwidth connections.
- **Verification**: Offline read test when network connectivity is toggled off.

#### Chunk 4.4 — Mobile Focused AI Tutor Workspace (Tabbed 3-Mode Layout)
- **Scope**: Mobile-optimized AI Tutor (`Lesson Board` | `Practice & Hints` | `Tutor Help`), progressive hint drawer, and `client_turn_id` retry resilience.
- **Verification**: Widget tests for mobile tutor state transitions.

#### Chunk 4.5 — Mobile Study Planner, Calendar & Active Study Heartbeat
- **Scope**: Mobile daily task checklist, study plan wizard, push notification reminders, and background-aware 30s active study heartbeat.
- **Verification**: Widget & service tests for mobile heartbeat pausing on app backgrounding.

#### Chunk 4.6 — Mobile Timed Exam Runner with Offline Answer Queue & Parent Portal
- **Scope**: Mobile exam runner with local SQLite answer autosave + automatic sync on reconnect, exam result rubric viewer, and mobile Parent Portal.
- **Verification**: `flutter test` suite covering offline exam answer queuing.

---

### Phase 5 — Handwritten Script OCR, Group Study & Gamification

#### Chunk 5.1 — Handwritten Answer Script Upload & Preprocessing Pipeline (Backend)
- **Scope**: Migration for `script_uploads`. Signed upload URLs (`POST /api/v1/exam-attempts/{id}/scripts/upload-url`), image orientation/contrast validation, and page ordering per question.
- **Verification**: Pest tests for multi-page script upload authorization and validation.

#### Chunk 5.2 — Multimodal Bangla/Math OCR & Provisional Rubric Grading (Backend)
- **Scope**: Implement `HandwritingOcrService` + rubric evaluation pipeline enforcing dual confidence gates (`ocr_confidence >= 0.85` AND `rubric_confidence >= 0.80`), routing low-confidence scripts to the Human Reviewer Queue.
- **Verification**: Pest tests for high-confidence auto-grading vs low-confidence reviewer escalation.

#### Chunk 5.3 — Handwritten Script Camera Scanner (Mobile/Web) & Reviewer Override UI
- **Scope**: Camera capture + crop/rotate uploader for students, annotated script feedback viewer, and Admin/Reviewer side-by-side OCR & rubric override interface.
- **Verification**: UI tests for script upload and reviewer mark adjustment.

#### Chunk 5.4 — Small-Group Batch Tutoring Rooms & Raise-Hand Queue (Reverb + Web/Mobile)
- **Scope**: Migrations for `group_sessions`, `group_participants`, and `raise_hand_events`. Real-time Laravel Reverb presence channels (`presence-group.session.{id}`) for 3–5 students, synchronized lesson board, and FIFO Raise-Hand queue.
- **Verification**: Pest broadcasting tests and Web group room UI verification.

#### Chunk 5.5 — Ethical Gamification, Streaks, Badges & Cohort Leaderboards
- **Scope**: XP ledger, daily consistency streaks (with Streak Freeze protection), milestone badges, and opt-in pseudonymous weekly cohort leaderboards.
- **Verification**: Pest tests for anti-gaming XP caps and privacy-preserving leaderboard queries.

---

### Phase 6 — Human Teacher Marketplace & Class 1–10 Expansion

#### Chunk 6.1 — Verified Human Teacher Onboarding & Vetting Module
- **Scope**: Teacher profiles, academic credential verification workflow, subject specialization mapping, and availability calendar.
- **Verification**: Pest tests for teacher onboarding and admin verification gates.

#### Chunk 6.2 — 1-on-1 & Small-Batch Live Teacher Booking + AI Diagnostic Hand-Off
- **Scope**: Slot booking, payment split/escrow, and automated pre-session **AI Student Diagnostic Brief** (sharing the student's recent misconceptions and mastery gaps with the human tutor).
- **Verification**: Pest tests for booking lifecycle and diagnostic brief generation.

#### Chunk 6.3 — Hybrid Human Script Review Marketplace
- **Scope**: Paid SLA queue allowing verified human teachers to grade escalated handwritten scripts and board-style creative exams (*সৃজনশীল*).
- **Verification**: Pest tests for reviewer assignment, grading completion, and payout ledger.

#### Chunk 6.4 — NCTB Class 9–10 (SSC) & Class 1–5 Curriculum Expansion
- **Scope**: Expand curriculum seeders, board examination rubrics, and age-appropriate UI modes for Primary (Classes 1–5) and SSC (Classes 9–10 Physics, Chemistry, Biology, Higher Math).
- **Verification**: Curriculum integrity and rubric tests across all 10 classes.
