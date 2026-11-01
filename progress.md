# AI Home Tutor Bangladesh — Phasewise Implementation Progress Tracker

This file is the single source of truth for tracking development progress across all phases and granular chunks of **AI Home Tutor Bangladesh (`home-tutor-platform`)**.

- **Environment Mode**: Native Local Stack (No Docker — PHP 8.2+/Laravel, MySQL 8.0+, Redis/Database Cache, Node.js/Next.js, Flutter SDK)
- **Detailed Chunk Specifications**: [`docs/development/development-roadmap.md`](./docs/development/development-roadmap.md)

---

## Overall Phase Summary

| Phase | Name | Chunks Completed | Progress | Status |
| :--- | :--- | :---: | :---: | :--- |
| **Phase 0** | Product Discovery & Academic Foundation | `4 / 4` | `100%` | Completed |
| **Phase 1** | Core Platform, Identity & Curriculum CMS Foundation | `8 / 8` | `100%` | Completed |
| **Phase 2** | AI Tutoring Engine & Personalized Study Planner (Core MVP) | `8 / 8` | `100%` | Completed |
| **Phase 3** | Examinations, Rubric Evaluation, Analytics & BD Billing | `8 / 8` | `100%` | Completed |
| **Phase 4** | Flutter Mobile Application & Offline Resilience | `6 / 6` | `100%` | Completed |
| **Phase 5** | Handwritten Script OCR, Group Study & Gamification | `5 / 5` | `100%` | Completed |
| **Phase 6** | Human Teacher Marketplace & Class 1–10 Expansion | `4 / 4` | `100%` | Completed |
| **Total** | **All Phases (`Phase 0` – `Phase 6`)** | **`43 / 43`** | **`100%`** | **Completed** |

---

## Phase 0 — Product Discovery & Academic Foundation (`4 / 4` Completed)

- [x] **Chunk 0.1 — Governance & Product Specifications** *(Completed: 2026-11-01)*
  - `README.md`, `AGENTS.md`, `docs/product/product-brief.md`, `docs/product/feature-specifications.md`
- [x] **Chunk 0.2 — Architecture & Client Conventions** *(Completed: 2026-11-01)*
  - `docs/architecture/system-architecture.md`, `backend-conventions.md`, `frontend-conventions.md`, `mobile-conventions.md`
- [x] **Chunk 0.3 — Database ERD & REST API Contracts** *(Completed: 2026-11-01)*
  - `docs/database/database-design.md`, `docs/api/api-conventions.md`
- [x] **Chunk 0.4 — AI Pedagogical Engine, Safety, Design System & Roadmap** *(Completed: 2026-11-01)*
  - `docs/ai/ai-tutoring-engine.md`, `docs/ai/ai-safety-and-evaluation.md`, `docs/design-system/design-principles.md`, `docs/development/development-roadmap.md`, `progress.md`

---

## Phase 1 — Core Platform, Identity & Curriculum CMS Foundation (`8 / 8` Completed)

- [x] **Chunk 1.1 — Laravel Backend Initialization & Modular Structure** *(Completed: 2026-11-01)*
  - Initialized `backend/` (Laravel native setup), 20 domain module folders (`app/Modules/*`), `ApiResponse` envelope helper, `/api/v1/health` endpoint, OpenAPI 3.1 contract (`backend/openapi/openapi-v1.yaml`), `Pint`, `PHPStan`, and `Pest` (`ArchTest.php` & `HealthCheckTest.php`).
- [x] **Chunk 1.2 — Next.js Web Initialization & Bangla/Math Design System** *(Completed: 2026-11-01)*
  - Initialized `apps/web/` (Next.js 15 App Router + TypeScript strict + Tailwind CSS + TanStack Query + Vitest), `Hind Siliguri` + `Noto Sans Bengali` + `Plus Jakarta Sans` + `JetBrains Mono` + `KaTeX`, Academic Navy (`#0F2942`) & Muted Teal (`#0D9488`) tokens, `<MathBanglaText />`, `toBanglaNumerals()`, and `src/services/api-client.ts`.
- [x] **Chunk 1.3 — Identity, Student/Guardian Profiles & BD SMS OTP Backend** *(Completed: 2026-11-01)*
  - Migrations & models (`users`, `student_profiles`, `guardian_profiles`, `otp_verifications`, `personal_access_tokens`), `PhoneNormalizer`, `SmsGatewayInterface` & `LogSmsGateway`, OTP send/verify endpoints (rate-limited to 3 per 5m), student/guardian registration & login/logout APIs, `/api/v1/students/me` endpoints, and Pest feature tests (`AuthAndOtpTest.php`).
- [x] **Chunk 1.4 — PDPA 2026 Guardian Linking & Child Consent Backend** *(Completed: 2026-11-01)*
  - Migrations & models (`student_guardian_links`, `consent_records`), `StudentOwnershipPolicy`, `EnsureMinorConsentVerifiedMiddleware` (`consent.verified`), guardian child list/link/approve/revoke APIs (`/api/v1/guardians/*`), and cross-tenant isolation tests (`GuardianConsentAndIsolationTest.php`).
- [x] **Chunk 1.5 — Auth, Onboarding & Guardian Consent Web UI (`apps/web`)** *(Completed: 2026-11-01)*
  - Student & Guardian Login/Register pages (`/login`, `/register`), 6-digit OTP verification modal (`<OtpVerificationModal />`), Class 6–8 Bangla Medium onboarding wizard (`/onboarding`), `<GuardianConsentPendingBanner />`, Guardian Consent screen (`/parent/children`), Parent `<ChildSwitcher />` header, and Vitest component tests (`AuthAndConsentUI.test.tsx`).
- [x] **Chunk 1.6 — Versioned NCTB Curriculum Engine & Seed Data (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`academic_years`, `curriculum_versions`, `classes`, `subjects`, `chapters`, `topics`, `learning_objectives`, `objective_prerequisites`, `academic_enrollments`), published version immutability guard, `PrerequisiteDagValidator`, Class 6–8 Bangla Medium Math (*গণিত*) & Science (*বিজ্ঞান*) seeder (`NctbCurriculumSeeder`), curriculum APIs (`/api/v1/curriculum/active`, `/api/v1/subjects`, `/api/v1/subjects/{subject}/chapters`, `/api/v1/chapters/{chapter}/topics`), and Pest tests (`NctbCurriculumEngineTest.php`).
- [x] **Chunk 1.7 — Academic Content CMS, Approval Workflow & Hybrid RAG Indexer (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`learning_resources`, `resource_rag_chunks`, `student_resource_annotations`), `Draft` → `In Review` → `Approved` → `Published` workflow (`TransitionResourceWorkflowAction`), `IndexPublishedResourceJob` & `HybridRagChunkSearchService`, watermarked PDF export (`GET /api/v1/resources/{id}/pdf`), `NctbLearningResourceSeeder`, and Pest tests (`AcademicContentAndRagTest.php`).
- [x] **Chunk 1.8 — Admin Curriculum CMS & Student Study Materials Reader (Web UI)** *(Completed: 2026-11-01)*
  - Admin Curriculum Tree Manager + Rich Markdown/KaTeX Content Editor & Reviewer Queue (`src/features/admin-cms/components/AdminCurriculumCmsWorkspace.tsx`, `/admin/curriculum`) + Student Subject/Chapter Explorer & Study Materials Reader (`src/features/curriculum/components/StudyMaterialsReader.tsx`, `/materials`) + Vitest tests (`CurriculumAndMaterialsUI.test.tsx`).

---

## Phase 2 — AI Tutoring Engine & Personalized Study Planner (`8 / 8` Completed)

- [x] **Chunk 2.1 — AI Orchestrator, PII Scrubber & Token Usage Ledger** *(Completed: 2026-11-01)*
  - Migrations & models (`prompt_versions`, `ai_requests`, `usage_ledger`, `ai_quality_flags`), `PiiScrubberService` (PDPA 2026 PII redaction + child safety & anti-cheating guardrails), `AIOrchestrator`, pluggable provider adapters (`GeminiProvider`, `OpenAiProvider`, `AnthropicProvider`, `DeterministicCurriculumAiProvider`), and Pest tests (`AiOrchestratorAndPiiScrubberTest.php`).
- [x] **Chunk 2.2 — Stateful 13-Stage AI Tutoring State Machine & RAG Retriever** *(Completed: 2026-11-01)*
  - Migrations & models (`tutor_sessions`, `tutor_messages`), `TutorLessonStage` (13 states mapped to 7 rail steps), `TutorStateMachine` (`START_LESSON` → `COMPLETED` with hard invariants on `MINI_ASSESSMENT` and completion), `AcademicRagRetriever` (`< 3,500` token context budget), `TutorResponseValidator`, and Pest tests (`TutorStateMachineAndRagTest.php`).
- [x] **Chunk 2.3 — Evidence-Based Mastery Calculation Service & Tutor API Endpoints** *(Completed: 2026-11-01)*
  - Migrations & models (`mastery_records`, `mastery_evidence_logs`), `MasteryCalculationService` (weighted EMA formula, difficulty multiplier, hint penalties, recency decay, summative evidence cap), `TutorEngineService`, idempotent Tutor REST APIs (`POST /api/v1/tutor-sessions`, `GET /api/v1/tutor-sessions/{session}`, `POST /api/v1/tutor-sessions/{session}/turns`, `/pause`, `/flag`), and Pest tests (`MasteryAndTutorApiTest.php`).
- [x] **Chunk 2.4 — 3-Pane AI Private Tutor Workspace — Left & Center Panes (Web UI)** *(Completed: 2026-11-01)*
  - Left Pane (`TutorLeftProgressionPane.tsx`: 7-step pedagogical progression rail, prerequisite status badge, evidence-based mastery progress bar) and Center Pane (`TutorCenterLessonCanvas.tsx`: NCTB concept & worked example board with `<MathBanglaText />`, interactive question card, math expression toolbar, progressive 3-level Hint drawer).
- [x] **Chunk 2.5 — 3-Pane AI Private Tutor Workspace — Right Pane & Pedagogical Controls (Web UI)** *(Completed: 2026-11-01)*
  - Right Pane (`TutorRightGuidancePane.tsx`: contextual tutor guidance + 1-click Bangla pedagogical buttons: *"আরেকটু সহজ করে বোঝাও"*, *"আরেকটি উদাহরণ দাও"*, *"ইঙ্গিত দাও"*, *"আগের অংশে ফিরে যাও"*), session pause/resume, 1-click hallucination flag escalation, Post-Lesson Summary Card, `/tutor` route, and Vitest tests (`AiPrivateTutorWorkspace.test.tsx`).
- [x] **Chunk 2.6 — Personalized Study Planner Engine & Adaptive Rescheduler (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`study_plans`, `study_plan_items`), `StudyPlanGeneratorService` (prerequisite remedial injection, mastery-based skipping/reinforcement, adaptive rescheduling of missed/struggling items), and Pest tests (`StudyPlannerAndHeartbeatTest.php`).
- [x] **Chunk 2.7 — Active Study Time Heartbeat Tracker & Calendar API (Backend)** *(Completed: 2026-11-01)*
  - Migration & model (`study_time_logs`), `HeartbeatIngestionAction` (`POST /api/v1/analytics/study-heartbeat`, 30s active ping, 120s idle cutoff), `StudyPlanAndCalendarController` (`/api/v1/study-plans`, `/api/v1/calendar`, `/api/v1/study-plan-items/{item}/reschedule`), and Pest tests (`StudyPlannerAndHeartbeatTest.php`).
- [x] **Chunk 2.8 — Study Planner Wizard, Learning Calendar & Heartbeat Hook (Web UI)** *(Completed: 2026-11-01)*
  - Study Plan Creation Wizard, Daily/Weekly/Monthly Learning Calendar (`StudyPlannerAndCalendarWorkspace.tsx`), task rescheduler & auto-rebalance, `useActiveStudyHeartbeat` hook (30s ping + 120s idle cutoff), `/planner` route, and Vitest tests (`StudyPlannerAndCalendarWorkspace.test.tsx`).

---

## Phase 3 — Examinations, Rubric Evaluation, Analytics & BD Billing (`8 / 8` Completed)

- [x] **Chunk 3.1 — Question Bank, Marking Rubrics & Exam Blueprint Engine (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`questions`, `marking_rubrics`, `exams`), support for `mcq_single`, `mcq_multi_statement` (*বহুপদী সমাপ্তিসূচক*), `fill_blank`, `math_problem`, and `creative_srijonshil` (*সৃজনশীল ক, খ, গ, ঘ*), `ExamGeneratorService`, and `NctbQuestionBankSeeder`.
- [x] **Chunk 3.2 — Timed Exam Attempt Lifecycle & Deterministic Objective Grader (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`exam_attempts`, `submitted_answers`), `ExamLifecycleService` (server-authoritative timer + 60s grace window, batch answer autosave, idempotent submission), and `DeterministicObjectiveGrader` (Bangla numeral normalization + instant 100% precision grading).
- [x] **Chunk 3.3 — Rubric-Based Written/Creative AI Evaluator & Review Queue (Backend)** *(Completed: 2026-11-01)*
  - Migration & model (`evaluations`), `AnswerEvaluatorService` (step-wise rubric mark clamping, common mistake detection, `confidence_score >= 0.80` gate vs `flagged_for_human` escalation), exam mastery feed into `MasteryCalculationService`, and Pest tests (`ExamsAndRubricEvaluationTest.php`).
- [x] **Chunk 3.4 — Timed Examination Runner & Rubric Result Breakdown (Web UI)** *(Completed: 2026-11-01)*
  - Distraction-free Timed Exam Runner (`TimedExaminationWorkspace.tsx` — server-synced countdown timer, question palette, flag-for-review, `localStorage` offline autosave), Detailed Rubric Result Breakdown screen, `/exams` route, and Vitest tests (`TimedExaminationWorkspace.test.tsx`).
- [x] **Chunk 3.5 — 5-Tier Student Performance Analytics & Weekly Parent Report Engine (Backend)** *(Completed: 2026-11-01)*
  - `LearningAnalyticsService` (5-tier analytics: Snapshot, Subject Matrix, Topic Weakness Detector, Bangla Recommendations, Weekly Trends), `LearningAnalyticsController` (`/api/v1/analytics/me`, `/api/v1/guardians/children/{studentCode}/weekly-report`, `/weekly-report/pdf`), and Pest tests (`LearningAnalyticsAndParentReportTest.php`).
- [x] **Chunk 3.6 — Student Performance Dashboard & Dedicated Parent Portal (Web UI)** *(Completed: 2026-11-01)*
  - Student Performance Analytics Dashboard (`StudentPerformanceDashboard.tsx`, `/analytics`), Dedicated Parent Portal (`GuardianParentPortalDashboard.tsx`, `/parent/dashboard` — child switcher, weak-topic radar, weekly study chart, PDF report download), and Vitest tests (`StudentAndParentAnalyticsUI.test.tsx`).
- [x] **Chunk 3.7 — Subscriptions, Usage Quotas & BD Payment Gateways (Backend)** *(Completed: 2026-11-01)*
  - Migrations & models (`subscription_plans`, `subscriptions`, `payments`), `SubscriptionPlanSeeder`, `PaymentGatewayInterface` (`BkashGateway`, `NagadGateway`, `SslCommerzGateway`), HMAC-verified idempotent webhooks, `SubscriptionQuotaMiddleware` (`quota.check`), and Pest tests (`SubscriptionsAndBdPaymentsTest.php`).
- [x] **Chunk 3.8 — Guardian Subscription Checkout & Billing Portal (Web UI)** *(Completed: 2026-11-01)*
  - Pricing tier selector (`Free`, `Basic`, `Premium`, `Family`), bKash/Nagad/SSLCommerz checkout flow (`GuardianBillingAndCheckoutWorkspace.tsx`), daily AI & monthly exam quota meters, `/parent/billing` route, and Vitest tests (`GuardianBillingAndCheckoutUI.test.tsx`).

---

## Phase 4 — Flutter Mobile Application & Offline Resilience (`6 / 6` Completed)

- [x] **Chunk 4.1 — Flutter App Initialization, Design System & Dio API Client** *(Completed: 2026-11-01)*
  - Initialized `apps/mobile/` (Flutter 3.35 + Dart 3.9 + Riverpod + GoRouter + Dio), `AcademicColors` & `toBanglaNumerals()` (`academic_theme.dart`), `MathBanglaRichText` & `OfflineStatusBanner` (`math_bangla_rich_text.dart`), `MobileApiClient` (`api_client.dart`), and `OfflineCacheStore` (`offline_cache_store.dart`).
- [x] **Chunk 4.2 — Mobile Auth, OTP, Onboarding & Parent Child-Switcher** *(Completed: 2026-11-01)*
  - Student/Guardian mobile login, 6-digit SMS OTP verification, PDPA 2026 guardian consent toggle, and Parent Child-Switcher (`mobile_auth_and_onboarding_screen.dart`).
- [x] **Chunk 4.3 — Mobile Curriculum Browser & Offline SQLite Study Materials Reader** *(Completed: 2026-11-01)*
  - NCTB Subject/Chapter explorer and offline caching for downloaded chapter notes, formulas, and worked examples (`offline_materials_reader_screen.dart`).
- [x] **Chunk 4.4 — Mobile Focused AI Tutor Workspace (Tabbed 3-Mode Layout)** *(Completed: 2026-11-01)*
  - Mobile AI Tutor (`পাঠ বোর্ড` | `অনুশীলন ও ইঙ্গিত` | `টিউটর সহায়তা`), progressive 3-level hint sheet, 1-click Bangla pedagogical buttons, and idempotent turn tracking (`mobile_ai_tutor_workspace.dart`).
- [x] **Chunk 4.5 — Mobile Study Planner, Calendar & Active Study Heartbeat** *(Completed: 2026-11-01)*
  - Daily study checklist, adaptive planner rebalance trigger, and active study heartbeat ping tracker (`mobile_study_planner_screen.dart`).
- [x] **Chunk 4.6 — Mobile Timed Exam Runner with Offline Answer Queue & Parent Portal** *(Completed: 2026-11-01)*
  - Timed mobile exam screen with offline answer autosave + reconnect sync queue, rubric result view, and mobile Parent Portal summary (`mobile_timed_exam_and_parent_screen.dart`), verified with `flutter analyze` and `flutter test` (`test/widget_test.dart`).

---

## Phase 5 — Handwritten Script OCR, Group Study & Gamification (`5 / 5` Completed)

- [x] **Chunk 5.1 — Handwritten Answer Script Upload & Preprocessing Pipeline (Backend)** *(Completed: 2026-11-01)*
  - Migration & model (`script_uploads`, `ScriptUpload`), image quality (`>= 0.70`) & orientation validation, and multi-page question mapping.
- [x] **Chunk 5.2 — Multimodal Bangla/Math OCR & Provisional Rubric Grading (Backend)** *(Completed: 2026-11-01)*
  - `HandwritingOcrAndGradingService`, dual confidence gates (`ocr_confidence_score >= 0.85` & `rubric_confidence_score >= 0.80`), low-confidence escalation (`escalated_to_human`), and human reviewer override (`POST /api/v1/script-uploads/{scriptUpload}/review-override`).
- [x] **Chunk 5.3 — Handwritten Script Camera Scanner (Mobile/Web) & Reviewer Override UI** *(Completed: 2026-11-01)*
  - Student script scanner & Admin/Reviewer side-by-side OCR & rubric override interface (`HandwritingGroupAndGamificationWorkspace.tsx`, `/scripts`), verified with Vitest (`HandwritingGroupAndGamificationUI.test.tsx`).
- [x] **Chunk 5.4 — Small-Group Batch Tutoring Rooms & Raise-Hand Queue (Reverb + Web/Mobile)** *(Completed: 2026-11-01)*
  - Migrations & models (`group_sessions`, `group_participants`, `raise_hand_events`, `group_broadcast_questions`, `group_broadcast_responses`, `group_individual_assistances`), `GroupTutoringService` & `GroupLearningController` (3–5 student same-class cohort cap, invitation-only `join_code`, Batch Mode shared broadcast poll with auto-reveal, Individual Side-Assistance mode without derailing shared board, PDPA 2026 PII scrubbing on raise-hand queue, and instant participant moderation), dedicated Web UI (`GroupLearningWorkspace.tsx`, `/group-learning`), Mobile screen (`mobile_group_learning_screen.dart`), and tests (`HandwritingGroupAndGamificationTest.php`, `GroupLearningCohortAndSafetyTest.php`, `GroupLearningWorkspace.test.tsx`).
- [x] **Chunk 5.5 — Ethical Gamification, Streaks, Badges & Cohort Leaderboards** *(Completed: 2026-11-01)*
  - Migrations & models (`xp_ledger`, `student_streaks`, `student_badges`), `EthicalGamificationService` (idempotent XP ledger, daily consistency streaks with Streak Freeze protection, milestone badges, and opt-in pseudonymous cohort leaderboards).

---

## Phase 6 — Human Teacher Marketplace & Class 1–10 Expansion (`4 / 4` Completed)

- [x] **Chunk 6.1 — Verified Human Teacher Onboarding & Vetting Module** *(Completed: 2026-11-01)*
  - Migration & model (`teacher_profiles`, `TeacherProfile`), teacher registration (`/api/v1/teachers/register`), credential verification workflow (`/api/v1/teachers/{teacher}/verify`), and specialization mapping.
- [x] **Chunk 6.2 — 1-on-1 & Small-Batch Live Teacher Booking + AI Diagnostic Hand-Off** *(Completed: 2026-11-01)*
  - Migration & model (`teacher_bookings`, `TeacherBooking`), `TeacherMarketplaceService` (80% teacher payout / 20% platform commission escrow split, and automated pre-session AI Student Diagnostic Brief hand-off), and Web UI (`TeacherMarketplaceAndExpansionWorkspace.tsx`, `/teachers`).
- [x] **Chunk 6.3 — Hybrid Human Script Review Marketplace** *(Completed: 2026-11-01)*
  - Migration & model (`script_review_assignments`, `ScriptReviewAssignment`), 24h SLA assignment & completion workflow for escalated handwritten scripts (`/api/v1/script-review-assignments`).
- [x] **Chunk 6.4 — NCTB Class 9–10 (SSC) & Class 1–5 Curriculum Expansion** *(Completed: 2026-11-01)*
  - `NctbClassOneToTenExpansionSeeder` expanding the 2026 NCTB curriculum across all 10 classes (Primary Classes 1–5, Lower Secondary Classes 6–8, and Secondary SSC Classes 9–10), `/api/v1/curriculum/classes-1-to-10`, Pest tests (`TeacherMarketplaceAndCurriculumExpansionTest.php`), and Vitest tests (`TeacherMarketplaceAndExpansionUI.test.tsx`).

