# API Conventions & Endpoint Specification (`/api/v1`)

This document defines the REST API contract between the **Laravel Backend (`backend/`)** and the **Next.js (`apps/web/`)** and **Flutter (`apps/mobile/`)** clients.

---

## 1. Core API Standards

1. **Base URL & Versioning**:
   - All endpoints are prefixed with `/api/v1/`.
   - Breaking changes require introducing `/api/v2/` while maintaining `/api/v1/` compatibility during mobile app rollout windows.
2. **OpenAPI 3.1 Contract-First**:
   - Every endpoint, request body, query parameter, and response resource is documented in `backend/openapi/openapi-v1.yaml` (generated/verified via `Scramble` or `L5-Swagger`).
   - Next.js (`openapi-typescript`) and Flutter (`dio` DTOs) generate their client types directly from this spec.
3. **Authentication & Security Headers**:
   - **Bearer Token**: Laravel Sanctum personal access tokens for mobile/API and HTTP-only CSRF-protected cookies or Bearer tokens for Next.js.
   - **Required Headers**:
     - `Accept: application/json`
     - `Content-Type: application/json`
     - `Accept-Language: bn-BD` (or `en-US`)
     - `X-Idempotency-Key: <UUIDv4>` (Mandatory for `POST` turn submissions, exam submissions, and payment checkouts)
     - `X-Active-Student-Id: <student_uuid>` (Used when a Guardian switches between linked children)

---

## 2. Standard JSON Response Envelopes

### 2.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "পাঠ সেশন সফলভাবে শুরু হয়েছে।",
  "data": {
    "session_uuid": "9c8e1a20-4b1e-4d9a-8c2f-123456789abc",
    "current_stage": "START_LESSON"
  },
  "meta": {
    "correlation_id": "req_01JBM9X7Z2K8",
    "curriculum_version": "NCTB-2026-BM-v1.0"
  }
}
```

### 2.2 Paginated Collection Response (`200 OK`)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 64,
    "last_page": 4
  },
  "links": {
    "first": "...?page=1",
    "last": "...?page=4",
    "prev": null,
    "next": "...?page=2"
  }
}
```

### 2.3 Standardized Error Response (`400`, `401`, `403`, `422`, `429`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "GUARDIAN_CONSENT_REQUIRED",
    "message": "এই ফিচারটি ব্যবহারের জন্য অভিভাবকের সম্মতি প্রয়োজন।",
    "details": {
      "guardian_phone_masked": "+88017******89",
      "consent_status": "pending"
    }
  },
  "meta": {
    "correlation_id": "req_01JBM9X7Z2K9"
  }
}
```

---

## 3. Complete `/api/v1` Endpoint Catalog

### 3.1 Authentication, Students & Guardians (`/api/v1/auth`, `/api/v1/students`, `/api/v1/guardians`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register/student` | Register student profile & trigger guardian SMS OTP invite | Public (Rate limited) |
| `POST` | `/api/v1/auth/register/guardian` | Register guardian account | Public (Rate limited) |
| `POST` | `/api/v1/auth/otp/send` | Dispatch BD SMS OTP for login or phone verification | Public (3 req / 5m) |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP and issue Sanctum access token | Public |
| `POST` | `/api/v1/auth/login` | Login with phone + password | Public |
| `POST` | `/api/v1/auth/logout` | Revoke active token | Authenticated |
| `GET` | `/api/v1/students/me` | Get active student profile, enrollment, and consent status | `student` |
| `PATCH` | `/api/v1/students/me` | Update student profile preferences & study targets | `student` |
| `GET` | `/api/v1/students/me/dashboard` | Study-desk read model for `/home` (see below) | `student` |
| `PATCH` | `/api/v1/study-plan-items/{item}/reschedule` | Also used by the dashboard routine to tick / un-tick a task (`status: completed \| scheduled`); un-ticking clears `completed_at` | `student` |

**`GET /students/me/dashboard` payload** (built by `StudentDashboardService`; every field is derived from stored evidence, nothing is presentation-only):
- `continue_lesson` — open tutor session (`session_id`, `learning_objective_id`, `chapter_number`, `current_stage`, `estimated_remaining_minutes` = today's planned minutes for that objective minus time spent, or `null` when it is not in today's plan).
- `next_lesson` — only when there is no open session: the first unfinished planned objective for today, so the hero card can start it (`/tutor?objective_id=`).
- `today_tasks[]` — today's `study_plan_items` (`task_type`, `chapter_title_bn`, `estimated_minutes`, `status`).
- `streak` — `current_days`, `freezes_available`, `week[]` (Saturday-first school week; a day is `studied` if it has a `study_time_logs` row with active seconds **or** lies inside the current streak run) and `next_milestone` (`3, 7, 14, 30, 60, 100` days).
- `gamification` — `total_xp`, latest `badges[]`, `level` (linear curve, `XP_PER_LEVEL = 250`).
- `subject_mastery[]` — per subject: `objectives[]` with `state` (`mastered` ≥ 75 mastery score, `in_progress`, `not_started`; capped at 12 blocks), `attempted_objectives`, and `next_chapter` (first chapter with an objective that is not yet mastered).
- `upcoming_exams[]` — latest exams for the class with `mcq_count`, `creative_count`, `question_count` from the exam blueprint. Exams currently have no schedule column, so no date is exposed.

The dashboard UI reads the tutor-question quota and plan from `GET /api/v1/me/entitlements` (`features['ai_tutor.daily_turns'].quota`, a **daily** limit). Free-text questions typed on the dashboard are *not* sent to the AI directly; they open `/tutor?session_id=…&q=…` and pre-fill the composer, so the tutor state machine validates the turn.
| `GET` | `/api/v1/guardians/children` | List all linked children and their summary metrics | `guardian` |
| `POST` | `/api/v1/guardians/children/link` | Link an existing student or create a new child profile | `guardian` |
| `POST` | `/api/v1/guardians/consent/approve` | Record explicit PDPA 2026 consent for a linked minor student | `guardian` |
| `POST` | `/api/v1/guardians/consent/withdraw` | Withdraw data processing consent and pause student AI access | `guardian` |

### 3.2 Curriculum & Study Materials (`/api/v1/curriculum`, `/api/v1/subjects`, `/api/v1/chapters`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/curriculum/active` | Get student's active NCTB `curriculum_version` & classes | Authenticated |
| `GET` | `/api/v1/curriculum/my-subjects` | The student's class tree: subjects → chapters (`topics_count`, `objectives_count`, `mastery_pct` 0–100) → `topics[]` → `learning_objectives[]` (`id`, `code`, `title_bn`, `bloom_taxonomy_level`, `mastery {score,status,attempts}` or `null`). Used by `/materials` and the top-bar search | Authenticated |
| `GET` | `/api/v1/subjects` | List subjects for active class & curriculum version (e.g., Class 8 Math, Science) | Authenticated |
| `GET` | `/api/v1/subjects/{subject}/chapters` | List chapters with student mastery % and syllabus status | Authenticated |
| `GET` | `/api/v1/chapters/{chapter}/topics` | List topics, learning objectives, and prerequisite graph | Authenticated |
| `GET` | `/api/v1/chapters/{chapter}/resources` | List published notes, summaries, definitions, formula sheets | Authenticated |
| `GET` | `/api/v1/resources/{resource}/pdf` | Generate/download watermarked offline PDF for chapter resource | Authenticated |

### 3.3 AI Tutoring Engine (`/api/v1/tutor-sessions`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tutor-sessions` | Start or resume a stateful tutoring session for a `topic_id` / `learning_objective_id` | `student` (Consented) |
| `GET` | `/api/v1/tutor-sessions/{session}` | Retrieve current state machine stage, lesson context, and turn history | `TutorSessionPolicy` |
| `POST` | `/api/v1/tutor-sessions/{session}/turns` | Submit student answer or action (`text_reply`, `simplify`, `example`, `hint`, `previous_step`) | `TutorSessionPolicy` + Idempotency |
| `POST` | `/api/v1/tutor-sessions/{session}/pause` | Pause session and persist active duration counter | `TutorSessionPolicy` |
| `POST` | `/api/v1/tutor-sessions/{session}/flag` | Report an inaccurate or confusing AI Tutor message for academic review | `TutorSessionPolicy` |

### 3.4 Personalized Study Planner & Calendar (`/api/v1/study-plans`, `/api/v1/calendar`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/study-plans/generate` | Generate a structured study plan for selected chapters & target date | `StudentOwnershipPolicy` |
| `GET` | `/api/v1/study-plans/active` | Fetch active study plan, overall completion %, and today's schedule | `StudentOwnershipPolicy` |
| `PATCH` | `/api/v1/study-plans/{plan}/items/{item}/reschedule` | Reschedule a task to a new date and trigger adaptive rebalancing | `StudentOwnershipPolicy` |
| `GET` | `/api/v1/calendar/tasks` | List tasks by `daily`, `weekly`, `monthly`, or `subject` filter | `StudentOwnershipPolicy` |
| `POST` | `/api/v1/calendar/heartbeat` | Log 30-second verified active study duration ping | `student` |

### 3.5 Examinations & Rubric Evaluation (`/api/v1/examinations`, `/api/v1/attempts`, `/api/v1/evaluations`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/examinations/generate` | Generate a Chapter-wise, Subject-wise, or Model Exam paper | `student` |
| `POST` | `/api/v1/examinations/{exam}/attempts` | Start timed exam attempt | `student` |
| `PATCH` | `/api/v1/attempts/{attempt}/autosave` | Idempotent autosave of MCQ selections, typed answers, and review flags | `ExamAttemptPolicy` |
| `POST` | `/api/v1/attempts/{attempt}/scripts/upload-url` | Request pre-signed S3 URL for handwritten script page upload | `ExamAttemptPolicy` |
| `POST` | `/api/v1/attempts/{attempt}/scripts/confirm` | Confirm uploaded script page and dispatch OCR & Rubric Evaluation job | `ExamAttemptPolicy` |
| `POST` | `/api/v1/attempts/{attempt}/submit` | Submit exam attempt, grade objective items immediately, queue written items | `ExamAttemptPolicy` + Idempotency |
| `GET` | `/api/v1/attempts/{attempt}/result` | Get detailed exam result, step-by-step rubric breakdown, and textbook citations | `ExamAttemptPolicy` |

### 3.6 Progress, Analytics, Groups & Subscriptions (`/api/v1/progress`, `/api/v1/groups`, `/api/v1/subscriptions`)
| Method | Endpoint | Description | Auth / Policy |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/progress/overview` | Overall mastery %, active hours, streak, subject & topic matrix | `StudentOwnershipPolicy` |
| `GET` | `/api/v1/progress/recommendations` | Actionable Bangla study recommendations based on weak objectives | `StudentOwnershipPolicy` |
| `GET` | `/api/v1/progress/reports/weekly` | Weekly parent academic summary & historical comparison | `StudentOwnershipPolicy` |
| `POST` | `/api/v1/groups` | Create a 3–5 student batch study group (Phase 5) | `student` |
| `POST` | `/api/v1/groups/{group}/sessions/{session}/raise-hand` | Join FIFO raise-hand queue in a live group tutoring session | `GroupPolicy` |
| `GET` | `/api/v1/subscriptions/plans` | List Free, Basic, Premium, and Family subscription plans | Public / Authenticated |
| `POST` | `/api/v1/subscriptions/checkout` | Initiate bKash, Nagad, or SSLCommerz payment session | `guardian` |
| `POST` | `/api/v1/webhooks/payments/{gateway}` | Signed webhook receiver for bKash, Nagad, and SSLCommerz | HMAC Signature Verified |

