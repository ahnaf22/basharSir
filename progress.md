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
- [x] **Student Dashboard Blackboard Study Desk (`Student-Dashboard.html`)**: Fully implemented the student study desk dashboard (`/home`) matching `Student-Dashboard.html`:
  - **Visual Desk Concept**: Single unified blackboard desk (`--slate: #0D1814`, `--slate-2: #13221C`, `--slate-3: #1A2D26`, `--chalk: #EDE8DA`, `--marigold: #FFB238`).
  - **Dynamic Greetings & Dates**: Time-of-day greeting (শুভ সকাল/দুপুর/বিকেল/সন্ধ্যা), Gregorian date in Bengali (e.g. "সোমবার, ২ নভেম্বর"), official Bangladesh Bongabdo solar calendar date (e.g. "১৭ কার্তিক ১৪৩৩"), and smart 1-sentence study summary.
  - **Unified Ledger Strip**: Replaced arbitrary metric tiles with a 4-column ledger strip:
    1. Continuous streak with school week day track (শ, র, সো, ম, বু, বৃ, শু) and freeze badge.
    2. Today's goal with SVG circular progress ring (animated strokeDashoffset).
    3. Interactive tasks completed count (`X/Y শেষ`).
    4. Total XP with next-level progress indicator.
  - **The One Bright Card (`.desk-now`)**: Chalk-white `#EDE8DA` focal surface displaying ongoing lesson, breadcrumb path, learning objective, 5-stage pedagogical step indicator, "পাঠ চালিয়ে যাও →" button, and interactive "Ask Tutor" question box with Socratic responses.
  - **Routine Timeline**: Today's personalized routine with interactive check buttons that toggle task completion, recalculate ledger metrics, and increase study ring progress in real time.
  - **Subject Mastery Matrix**: Visual chapter objective block indicators with empty state explanations.
  - **Bottom Row**: Badges shelf with SVG award icons and level progress meter, Khata upload drag-and-drop zone with ruled exercise paper preview, and upcoming model test panel.
  - **Mobile Tab Bar & CSS Isolation**: 5-tab fixed bottom navigation on mobile with elevated marigold Tutor action. Removed internal prototype 'ডিজাইন নোট' buttons and custom debug widgets across student desk and auth portals. Scoped all `.student-desk` layout styles to prevent global CSS collisions. Fully verified against MySQL backend API (`GET /api/v1/students/me/dashboard`).
  - **Dynamic Data Pass** *(2026-11-03)*: Removed every hardcoded/demo value from the study desk. Backend: extracted `StudentDashboardService` (controller now thin) and added derived fields — `next_lesson`, `streak.week` (Saturday-first, from study-time logs + streak run), `streak.next_milestone`, `gamification.level`, per-objective `subject_mastery.objectives` + `next_chapter`, exam MCQ/creative counts, `estimated_remaining_minutes`. Frontend: routine ticks persist via `PATCH /study-plan-items/{id}/reschedule` (optimistic, rolls back on error); hero card resumes the real session (`/tutor?session_id=`; previously linked a UUID the tutor page ignores) or starts the next planned objective, with honest empty states; sidebar quota/plan from `/me/entitlements`; mastery blocks, badges, XP level, week track and exam chips all API-driven; top-bar search matches the student's own chapters/topics and deep-links `/materials?chapter_id=`; ask-box hands the question to the tutor workspace composer instead of canned demo replies; khata card links to `/scripts` instead of a fake "demo" upload. Tests: Pest `StudentAggregateAndDemoDataTest` extended, Vitest `StudentHomeAndMaterials` + new `dashboard-view.test.ts` (41/41 web tests green, `tsc` clean, Pint + PHPStan clean).
  - **Study Desk Shell Everywhere** *(2026-11-03)*: The study-desk sidebar/top bar/mobile tab bar is now one shared `StudyDeskShell` (`components/layout`), and `AppShell` delegates to it, so every sidebar item (আজ, AI Tutor, রুটিন, বই ও নোট, মডেল টেস্ট, খাতা মূল্যায়ন, অগ্রগতি, পড়ার আড্ডা, শিক্ষক বুকিং) opens its page inside the same shell with the active item highlighted. Added: profile menu (শিখন প্রোফাইল, প্যাকেজ ও বিলিং, লগআউট, closes on outside click/Esc), plan card linking to billing, a mobile "আরও" sheet with the full menu + logout, a guardian variant (parent dashboard, সন্তান ও সম্মতি, বিলিং, শিক্ষক বুকিং, child switcher), and top-bar search on every student page. Dashboard CSS content selectors are now scoped under `.home-desk` so they cannot hijack Tailwind classes on other pages. Bugs found by loading each page against the real API and fixed: planner crashed on seeded `concept_review` tasks; `/curriculum/my-subjects` omitted the nested `topics` the materials page and search need (materials page + search crashed) and returned `mastery_pct` x100 (369%). Tests: new `desk-nav.test.ts` (every menu href must have a real page file), `StudyDeskShell.test.tsx`; Pest `my-subjects` contract assertions. Known leftover: several inner pages (exams, tutor, planner) use light cards with chalk-coloured text, so some text is low-contrast on them.
  - **Study Desk CSS Leak Fix** *(2026-11-03)*: The dashboard still looked broken because `globals.css` carries the marketing landing page's *unscoped* rules (`section{padding-block:clamp(76px,10vw,140px)}`, `.app{border;border-radius;overflow:hidden;margin-top}`, `.chip`, `.bub`, `.tutor`, `main`, `header`, `.logo-word`) that share names with the dashboard and leaked through every property `.student-desk` did not set — giant gaps around the greeting/ledger and a non-sticky sidebar. Added a "leak guard" block to `student-dashboard.css` resetting exactly those properties, restored the design's default `<p>` margin on sidebar group labels, avatar initial now uses the first grapheme (`রা`), plan name drops its bilingual parenthetical, XP badge shows its number in the starburst. Verified by rendering the real page (headless Chrome, logged in as the demo student) at 1366/900/390px next to `Student-Dashboard.html`; 44/44 web tests green, `tsc` clean.

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



### Student desk audit fixes (impeccable audit follow-up)
- Inner student pages (tutor, planner, exams, scripts, analytics, teachers, group learning) now pass WCAG AA text contrast at 1366px and 390px (measured in headless Chrome: 0 failing text nodes on all 9 routes, previously up to 92 per route). Done through a "light-card bridge" in `student-dashboard.css`; moving each feature onto desk tokens is still open.
- Tutor guidance pane shows the Bangla stage label instead of raw state codes; nested `<main>` and duplicate `<h1>` removed from tutor, exams, planner and group learning.
- Controls are at least 24px; `--chalk-3` raised to `#8E9A90` for AA on slate-3; math display blocks scroll inside their line.

### Student desk audit round 2 (harden, extract, optimize, distill, polish)
- **Harden:** new `useFocusTrap` hook (`src/lib/useFocusTrap.ts`, unit-tested) traps Tab, closes on Esc and restores focus for the mobile "আরও" sheet and `OtpVerificationModal`. Desk-wide `:focus-visible` ring now survives Tailwind `focus:outline-none` (marigold on dark, `#7A4A00` on light cards). Global reduced-motion rule keeps a 0.12s colour/opacity fade instead of killing all transitions. Materials headings are now h1 → h2 → h3.
- **Extract:** `!important` in `student-dashboard.css` cut from 928 to 22 (20 on hover/focus/active rules, 2 needed shorthands). Verified by computed-style snapshot diff on 9 routes at 1366/900/390px: no real differences (only the exam countdown timer changes between snapshots).
- **Optimize:** KaTeX CSS moved from `globals.css` into `MathBanglaText`, so routes without maths no longer load it.
- **Distill/Polish:** removed unused `Stat` component (and its test); landing `.quote` side-stripe replaced by a full hairline border.
- Verified: tsc clean, Vitest 18 files / 53 tests, rendered audit 0 contrast/target/heading/overflow failures on 18 route-viewport checks.
- Still open: the light-card bridge (features still use Tailwind teal/slate/white), 543 hex literals mostly in landing components, route-weight measurement, touch-gesture and physical-device checks.

### Student desk audit round 3 (extract, optimize, adapt, polish)
- **Extract:** feature components no longer rely on the CSS bridge for the teal/navy palette. New Tailwind `desk-*` roles (`bg-desk-accent`, `text-desk-accent-ink`, `bg-desk-accent-soft`, `border-desk-accent-line`, `bg-desk-ink`, hover variants) are backed by `--desk-*` variables in `student-dashboard.css`; ~140 class references across 12 feature files were migrated and the teal/hex bridge rules deleted. Remaining bridge: white/slate/amber/emerald light-surface variable re-binding. `tailwind.config.ts` chalk-3 synced to `#8E9A90`. Verified by computed-style diff on 9 routes at 1366/900/390px: only intended palette corrections (leftover real-teal/navy tints now desk marigold/ink).
- **Optimize:** KaTeX CSS loads only on maths routes (25 kB raw / 3.9 kB gz). Splitting the desk/auth CSS out of `globals.css` was tried and reverted: it changes the cascade against Tailwind utilities (fonts and padding shifted). It needs `@layer` ordering work first.
- **Adapt:** synthesised touch (CDP) on a 390px emulated viewport: "আরও" sheet opens and closes by tap, vertical swipe scrolls, no horizontally scrolling strips on any route. 900px tablet: no overflow on any route. At 150% text size group-learning overflowed 35px; fixed with `min-w-0`/`shrink-0` on `flex-1` inputs. Physical device and screen reader still untested.
- **Polish:** landing hex literals reviewed: they are SVG illustration colours on the landing's own palette, not UI tokens, so left as-is.
- Verified: tsc clean, `next build` passes, Vitest 18 files / 53 tests, rendered audit 0 failures on 18 route-viewport checks.

### Student desk audit round 4 (optimize, extract, adapt, polish)
- **Optimize:** `student-dashboard.css` is now imported by `StudyDeskShell` and `auth.css` by the login/register pages instead of `globals.css`. Production build: layout CSS (87 kB) carries no desk or auth rules; desk CSS (33 kB raw / 6.6 kB gz) loads only on desk routes, auth CSS (14 kB / 3.6 kB gz) only on login and register, KaTeX CSS only on maths routes. Two order-sensitive zero-intent rules (`:where(button)` font inheritance, `section` padding reset) were rewritten at lower specificity so Tailwind utilities keep winning after the move. Verified with the computed-style diff: login/register identical; desk routes differ from the pre-split baseline only by the earlier intentional group-learning `min-w-0` fix.
- **Extract:** light-surface colours are now named `desk-*` roles (`bg-desk-paper`, `-paper-2`, `-paper-3`, `bg-desk-track`, `border-desk-line(-soft/-strong)`, `text-desk-text`, `-text-2`, `-muted`) backed by CSS variables on `.student-desk`. Text roles are contextual: chalk on the desk, ink on paper (the paper selector re-binds them). 9 feature files migrated (about 200 class swaps); the bridge selectors no longer key on Tailwind `bg-white`/`slate-*`, and the `text-slate-400/500` override was deleted. Dark-surface uses (exam timer, parent hero, selected billing chip) were left on purpose. Computed-style diff: only text colours (slate shades folded into three ink tones) and nine 70%-alpha backgrounds changed, no layout change.
- **Adapt:** accessibility tree (what screen readers read) checked at 390px on 9 routes: every control has a name, no unnamed images, banner/main/navigation/complementary landmarks present. Physical-device and TalkBack/NVDA testing are still manual and not done.
- Verified: tsc clean, `next build` passes, Vitest 18 files / 53 tests, rendered audit 0 contrast/target/heading/overflow failures on 18 route-viewport checks.
- Still open: KaTeX JS (about 75 kB) on maths routes, real-device and screen-reader QA, and the OTP modal and parent hero chip that intentionally stay off the desk roles.

### Student desk audit round 5 (optimize, extract, adapt, polish)
- **Optimize:** the landing page's rules (about 3,100 lines of unscoped `section`, `.panel`, `.chip`, `.bub`, `main`, `header`, `.btn` ...) moved from `globals.css` into `src/styles/landing.css`, imported only by `app/page.tsx`. `globals.css` now holds just Tailwind, the colour/font tokens, base resets, `.board-tex` and the reduced-motion rule (117 lines). Production build: global CSS 87 kB -> 47 kB raw (18.1 -> 9.3 kB gz); `/login` loads 61 kB (global + 14 kB auth), student/parent routes 80 kB (global + 33 kB desk), landing 87 kB (global + 40 kB landing). Before the split every route loaded the combined 130 kB+.
- The app had silently depended on a few landing rules, found by the computed-style diff and restored as scoped rules: positioning contexts for `section`/`main`/`header`/`footer`/`.panel` in the desk (zero specificity so Tailwind utilities still win), `.bub`/`.ava` sizing and `overflow-x: clip` on the login panel. The desk "leak guard" that undid landing rules was deleted as dead code (about 45 lines).
- Verified with the computed-style diff: login/register identical; desk routes identical apart from invisible zero-width border colours and the live exam countdown digits; landing identical apart from animation frames.
- **Extract / Adapt / Polish:** no new work. The brand/status variable bridge for paper chips stays until those components are next rewritten; real-device and TalkBack/NVDA QA remain manual.
- Verified: tsc clean, `next build` passes, Vitest 18 files / 53 tests.

### Student desk audit round 6 (polish, adapt, typeset, optimize) — first rendered audit of landing, login and register
- **Polish (contrast):** `--chalk-3` in `globals.css` was `#7E8A80` (4.03:1 on the raised board panels) while the desk used `#8E9A90`; both surfaces now use `#8E9A90`. The landing red pen on paper (`#D2382B`, 4.07:1) is `#B8281D` (5.3:1) and the auth `.eg` hint (`#7A776B`, 3.77:1) is `#65625A` (5.1:1). Landing step ৫ had both `d` and `now` classes, which painted a marigold numeral on a marigold circle; it is now `now` only. Landing footer headings are h3 (were h4 after h2).
- **Adapt:** login/register board footer links are 44px tall (were 20–23px). The remaining sub-24px auth links sit inside a sentence, which WCAG 2.5.8 exempts.
- **Typeset:** 12px floor for text on live routes: `text-[10px]`/`text-[11px]` replaced with `text-xs` in 12 feature/UI files, desk pill `0.72rem` -> `0.75rem`, and home badge captions (browser-default `small` shrink gave 10px) pinned to `0.75rem`. KaTeX sub/superscripts and the landing page's mock UI are unchanged by design. Unused `components/home/*` was not touched.
- **Optimize:** fonts are self-hosted with `next/font/google` (Anek Bangla, Hind Siliguri, Noto Sans Bengali, Atma, JetBrains Mono, Plus Jakarta Sans) instead of a render-blocking `fonts.googleapis.com` stylesheet. Atma, JetBrains Mono and Plus Jakarta are `preload: false`. Pages now request fonts from their own origin only; `--f-*` / `--font-*` tokens and the Tailwind `fontFamily` roles resolve through the `--nf-*` variables. SVG `fontFamily` attributes became `style={{ fontFamily: 'var(--f-…)' }}`.
- Verified: tsc clean, Vitest 18 files / 53 tests, `next build` passes, rendered audit (9 desk routes + landing/login/register at 1366 and 390px): 0 contrast failures except the aria-hidden decorative watermark, 0 overflow, h1 = 1, no heading skips. Screenshots checked for landing step ৫, login footer and analytics at 390px.
- Still open: landing mock-UI text at 10–11.5px, real-device and TalkBack/NVDA QA, paper-chip brand/status bridge, KaTeX JS weight.

### Student desk audit round 7 (harden) — landing mobile menu
- **Harden:** the landing page's mobile menu (`.sheet`) was kept off-screen with `transform` while its `display: flex` overrode the `hidden` attribute, so its logo, close button and four links were still tabbable and exposed as an open `aria-modal` dialog. Closed state is now `visibility: hidden` (switching after the slide-out, instantly under reduced motion), so the links leave the tab order and the accessibility tree. While open it uses the shared `useFocusTrap` (focus moves into the menu, Tab wraps, Esc closes, focus returns to the "মেনু" button) and locks page scroll.
- Verified by CDP at 1366 and 390px: closed menu has no tab stops; opened: focus enters, Tab wraps after the last link, Esc closes and restores focus, body scroll lock released. tsc clean.
- Remaining from the round 7 audit: landing mock-UI text size (typeset), KaTeX lazy-load and unused `components/home/*` (optimize), auth focus ring and colour literals (polish).

### Student desk audit round 7 (typeset, optimize, polish)
- **Typeset:** landing mock-UI text raised to the 12px floor (weekday initials, queue avatars, locked-badge caption). The one 10px label left is the SVG book-spine "গণিত" inside the hero illustration.
- **Optimize:** KaTeX JS and CSS now load only when a string contains a formula. `MathBanglaText` tokenizes with `tokenizeMathBangla` (no library) and shows the plain LaTeX source until `loadKatex()` resolves; `parseMathBanglaSegments(raw, katex)` takes the renderer. First Load JS: `/analytics` 217 -> 141 kB, `/exams` 219 -> 143, `/group-learning` 220 -> 144, `/materials` 220 -> 145, `/tutor` 221 -> 146, `/parent/dashboard` 219 -> 143. `/planner` and other routes without maths never request the KaTeX chunks (verified in the browser). Tests that assert KaTeX output now `waitFor` it; added `src/types/css.d.ts` for the lazy CSS import. Deleted the unused `components/home/*` (9 files) and `LandingHeader`/`LandingFooter`.
- **Polish:** login/register focus ring is the marigold ring used on the landing page and desk. Repeated colour literals in `landing.css`/`auth.css` became tokens in `globals.css`: `--board-ink`, `--marigold-deep`, `--paper-red`, `--paper-red-ink`, `--paper-muted(-2)`, `--tick-ink` (documented in DESIGN.md).
- Verified: tsc clean, Vitest 18 files / 54 tests, `next build` passes, rendered audit (9 desk routes + landing/login/register at 1366 and 390px): 0 contrast failures apart from the aria-hidden watermark, 0 overflow, h1 = 1, no heading skips; maths render on tutor/exams/analytics/group-learning with no unrendered formulas.
- Still open: real-device and TalkBack/NVDA QA, paper-chip brand/status bridge, parent routes with a real guardian login.
