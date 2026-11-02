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
| **Phase 7** | Functional Architecture, Entitlements & Web UI Rebuild | `10 / 10` | `100%` | Completed |
| **Brand** | **পড়া হবে! (PORA HOBE) Brand Transformation & Creative UI/UX** | `9 / 9` | `100%` | Completed |
| **Theme Alignment** | **Blackboard Dark Theme (`pora-hobe-home.html`) Across All Pages** | `14 / 14` | `100%` | Completed |
| **Total** | **All Phases & Dark Theme Transformation** | **`76 / 76`** | **`100%`** | **Completed** |

---

## Blackboard Dark Theme (`pora-hobe-home.html`) Site-Wide Implementation

- [x] **Theme Tokens & Design System**: Established `--slate: #0D1814` (blackboard green-black), `--chalk: #EDE8DA`, `--marigold: #FFB238`, `--tick: #7FD6A0`, `--redpen: #FF6152`, and khata notebook tokens in `globals.css` and `tailwind.config.ts`.
- [x] **Homepage Match 1:1**: Implemented every section from `apps/web/pora-hobe-home.html` in `page.tsx`:
  - 01 Hero with Dhaka grill window SVG, study lamp, steaming tea, student at laptop with $2x + 5 = 15$, and floating tutor chat card.
  - Slogans Ticker with diamond separators and infinite marquee loop.
  - 02 Statement with interactive tooltips and questioning chips.
  - 03 Interactive Tutor Simulator with step-by-step math solver, Socratic hints, and replay.
  - 04 Mistakes Khata with ruled exercise book page, ballpoint blue handwriting, red strike-through, and Level Up stamp.
  - 05 Progress Dashboard with 12-day streak (Sat-Fri BD week), SVG week chart, and goal ring.
  - 06 Achievement Celebration with 100% completion ring, confetti canvas particles, and roadmap badges.
  - 07 Exam Simulator with 28:45 countdown timer, 20-question palette, interactive MCQ options, and handwritten script panel.
  - 08 Porar Adda Room with 4 students + central Tutor audio waveform + 1-click invite code copy.
  - 09 Final CTA with interactive chalk dust canvas particles, ghost wordmark, and primary button.
- [x] **Site-Wide Dark Theme Alignment**: Mapped semantic tokens across `AppShell.tsx`, `Button.tsx`, `Card.tsx`, and verified 14 application routes (`/login`, `/register`, `/home`, `/tutor`, `/materials`, `/planner`, `/exams`, `/scripts`, `/analytics`, `/group-learning`, `/teachers`, `/parent/dashboard`, `/parent/billing`, `/parent/children`) all return HTTP 200 OK with unified dark styling.
- [x] **Auth Page Transformation (`পড়া হবে! Login.html`)**: Transformed `/login` and `/register` into dedicated standalone authentication portals with zero dashboard menus (`AppShell` removed). Implemented 2-column "Board + Desk" layout with authentic Khata notebook scrap checklist, rotating AI tutor quips, dynamic operator detection (+৮৮), mobile OTP 6-box input with paste/auto-advance/resend timer, role switching (Student vs Guardian), 1-click test fill chips, and animated completion resume cards.

---

## Brand Transformation — পড়া হবে! (PORA HOBE) (`9 / 9` Sections Completed)

- [x] **Section 01 — Hero: পড়ার সিন এবার বদলে যাবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/HeroSection.tsx`.
  - Main headline: "পড়ার সিন এবার বদলে যাবে!", copy: "তোমার নিজের AI Home Tutor। পড়বে, বুঝবে, প্রশ্ন করবে, ভুল করবে, আবার শিখবে। সবকিছু তোমার নিজের গতিতে।"
  - Primary CTA: "চলো, পড়া শুরু করি!", Secondary CTA: "কীভাবে কাজ করে?". Floating campaign badge: "প্যাঁচ যতই থাকুক, পড়া হবে!".
  - Integrated high-res authentic Bangladeshi student photo and realistic interactive AI tutor card with 1-click demo persona quick-access.
- [x] **Section 02 — Brand Statement: শুধু পড়া নয়, এবার শেখা জমবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/BrandStatementSection.tsx`.
  - Editorial layout with three asymmetric highlights: "বুঝে শেখো", "প্রশ্ন করে শেখো", "ভুল থেকে শেখো".
- [x] **Section 03 — Interactive Tutor Simulator: প্যাঁচ যতই থাকুক, পড়া হবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/InteractiveTutorSection.tsx`.
  - Realistic multi-step tutoring simulator ($2x + 5 = 15$) with step-by-step state machine, hints, "এই তো! মাথায় ঢুকছে!", and celebration "চ্যাপ্টার ক্লিয়ার, বস!".
- [x] **Section 04 — Learning From Mistakes: ভুল হইছে? সমস্যা নাই, আবার হবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/LearningFromMistakesSection.tsx`.
  - Interactive before/after error diagnostic simulator, showing students why mistakes are valuable learning signals.
- [x] **Section 05 — Progress & Mastery: পড়ো একটু, এগিয়ে যাও অনেকটা!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/ProgressSection.tsx`.
  - Clean 4-metric KPI dashboard (Mastery Score, Solved Exercises, Accuracy, Streak) and chapter progress bars for NCTB Math and Science.
- [x] **Section 06 — Achievement & Celebration: চ্যাপ্টার খতম, কনফিডেন্স ডাবল!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/AchievementSection.tsx`.
  - Milestone unlock badges, streak counter, celebratory feedback, and self-confidence building mechanisms.
- [x] **Section 07 — Realistic Examination Preview: পরীক্ষার প্রস্তুতি? এবার সিরিয়াসলি হবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/ExaminationSection.tsx`.
  - Timed exam simulator preview with countdown timer, question palette, option selection, and handwritten answer script scanning support.
- [x] **Section 08 — Group Learning: বন্ধুদের নিয়ে পড়ার আড্ডাও হবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/GroupLearningSection.tsx`.
  - Cohort room card (4 students), real-time peer assistance, and broadcast challenge polls.
- [x] **Section 09 — Final CTA & Branded Footer: পড়ার সিন এবার বদলে যাবে!** *(Completed: 2026-11-02)*
  - Created `apps/web/src/components/home/FinalCTASection.tsx` and `apps/web/src/components/layout/LandingFooter.tsx`.
  - Class picker (৬ষ্ঠ - ১০ম SSC), primary CTA "চলো, পড়া শুরু করি!", "আজকে পড়া হবে, বুঝেও হবে!", and comprehensive NCTB 2026 / PDPA 2026 footer.
  - Assembled in `apps/web/src/app/page.tsx`, tested with `npx tsc --noEmit` and `npm test -- --run` (32/32 tests passing).

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

---

## Phase 7 — Functional Architecture, Entitlements & Complete Web UI Rebuild (`2 / 10` Completed)

- [x] **Chunk 7.1 — Entitlements & Subscriptions Engine (Backend)** *(Completed: 2026-11-01)*
  - Migration & model (`plan_entitlements`, `PlanEntitlement`), `PlanEntitlementService` with tiered access limits (Free, Basic, Premium, Family), `EnsureFeatureEntitledMiddleware` (`entitlement:feature_key`), OTP `debug_code` in local/testing environment, `/api/v1/me/entitlements`, `/api/v1/auth/me`, and sandbox payment simulation (`POST /api/v1/payments/{payment:uuid}/sandbox-confirm`). Verified with Pest (`PlanEntitlementsAndSandboxTest.php`).
- [x] **Chunk 7.2 — Aggregate Student & Curriculum Endpoints + Realistic Demo Seeder (Backend)** *(Completed: 2026-11-01)*
  - Single-trip composite endpoints (`GET /api/v1/students/me/dashboard`, `GET /api/v1/curriculum/my-subjects`, `GET /api/v1/students/me/exam-attempts`, `GET /api/v1/gamification/me`), and comprehensive `DemoDataSeeder` establishing realistic interconnected data across student, guardian, tutor session, study plan, study time logs, exams, and gamification via real domain services. Verified with Pest (`StudentAggregateAndDemoDataTest.php`).
- [x] **Chunk 7.3 — Web Foundation & Design System Rebuild (`apps/web`)** *(Completed: 2026-11-01)*
  - Production academic design tokens, reusable component library (`Button`, `Card`, `Stat`, `Badge`, `EmptyState`, `Skeleton`, `FeatureGate`, `QuotaMeter`, `Input`), persisted auth store (`auth.store.ts` via Zustand with `localStorage` token & automatic `/auth/me` bootstrap), and role-guarded `AppShell` with student/guardian/teacher/admin navigation. Verified with Vitest (`FoundationAndComponents.test.tsx`).
- [x] **Chunk 7.4 — Auth & Onboarding UI Rebuild (`apps/web`)** *(Completed: 2026-11-01)*
  - Dual student/guardian login (`/login`) with quick 1-click demo test account selector (Rafi Class 8, Nusrat Class 6, Rasheda Guardian), passwordless OTP login modal displaying testing `debug_code` auto-fill, registration (`/register`) with automatic post-OTP redirection, student onboarding (`/onboarding`) with class & daily minutes selection, and PDPA 2026 guardian consent management (`/parent/children`).
- [x] **Chunk 7.5 — Student Home Dashboard & Learn Materials (`apps/web`)** *(Completed: 2026-11-01)*
  - Fully wired student dashboard (`/home`) connected to `GET /api/v1/students/me/dashboard` (real streak, XP, badges, continue lesson hero, today's tasks, and subject mastery percentage bars with 0 hardcoded dummy arrays), and curriculum explorer (`/materials`) connected to `GET /api/v1/curriculum/my-subjects` with accordion chapter navigation, interactive worked examples, 1-click tutor lesson launching, and gated PDF note downloads. Verified with Vitest (`StudentHomeAndMaterials.test.tsx`).
- [x] **Chunk 7.6 — AI Tutor 3-Pane Workspace Rebuild (`apps/web`)** *(Completed: 2026-11-01)*
  - 3-Pane pedagogical learning workspace (`/tutor`) wired directly to backend API (`POST /tutor-sessions`, `GET /tutor-sessions/{id}`, `POST /tutor-sessions/{id}/turns`, `POST /tutor-sessions/{id}/pause`), dynamic URL routing (`?session_id=...` & `?objective_id=...` or auto-resume active dashboard session), KaTeX math board, 3-level progressive hint sheet, Socratic question answering, and active entitlement quota checking. Verified with Vitest (`AiPrivateTutorWorkspace.test.tsx`).
- [x] **Chunk 7.7 — Study Planner, Exams & Progress Analytics (`apps/web`)** *(Completed: 2026-11-01)*
  - Fully wired adaptive study planner (`/planner`) with active plan fetching and non-judgmental rebalancing, timed model exam runner (`/exams`) with server-countdown timer, question palette, autosave, submission, past attempt history list, and step-by-step rubric result analysis, and learning analytics (`/analytics`) with live mastery matrices and weekly active study time trends. Verified with Vitest (`TimedExaminationWorkspace.test.tsx`, `StudyPlannerAndCalendarWorkspace.test.tsx`, `StudentAndParentAnalyticsUI.test.tsx`).
- [x] **Chunk 7.8 — Group Learning & Handwritten Script Submission (`apps/web`)** *(Completed: 2026-11-01)*
  - Role-guarded and entitlement-gated group study (`/group-learning`) enforcing 3–5 student same-class cohorts, batch broadcast questions with auto-reveal, individual side-assistance, and PDPA PII scrubbing in raise-hand queue, and handwritten script scanner (`/scripts`) with camera/file upload, OCR confidence gates, multi-tier rubric grading, and admin review-override interface. Verified with Vitest (`GroupLearningWorkspace.test.tsx`, `HandwritingGroupAndGamificationUI.test.tsx`).
- [x] **Chunk 7.9 — Parent Portal, Subscription Billing & Teacher Marketplace (`apps/web`)** *(Completed: 2026-11-02)*
  - Integrated parent portal dashboard (`/parent/dashboard`) with live child switcher, 5-tier analytics normalization adapter, KaTeX math rendering, and PDF report card downloads; subscription billing (`/parent/billing`) with tiered pricing plans, active subscription status, and 1-click sandbox payment confirmation (`POST /api/v1/payments/{uuid}/sandbox-confirm`); and verified human teacher marketplace (`/teachers`) gated by `teacher_marketplace.booking` with 80/20 escrow splits and AI diagnostic brief generation. Verified with Vitest (`GuardianBillingAndCheckoutUI.test.tsx`, `TeacherMarketplaceAndExpansionUI.test.tsx`) and verified with clean production Next.js build (`next build` 19/19 routes prerendered).
- [x] **Chunk 7.10 — Mobile Verification (`apps/mobile`)** *(Completed: 2026-11-02)*
  - Verified Flutter mobile client against API contracts and offline architecture invariants: offline SQLite/cache store, Bangla numeral formatting, 3-mode AI tutor workspace, offline NCTB chapter reader, background study heartbeat tracking, timed exam offline draft queue with sync on reconnection, and group study room with batch broadcast reveal. Verified with `flutter analyze` (0 issues) and `flutter test` (all tests passed).


