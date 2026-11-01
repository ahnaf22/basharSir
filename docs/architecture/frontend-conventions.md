# Next.js Web Frontend Architecture & Conventions

This document defines the architecture, folder organization, state management, and coding conventions for the **Next.js (`apps/web/`)** web application serving Students, Parents/Guardians, and Administrators/Content Reviewers.

---

## 1. Core Technology Stack

| Category | Technology | Standard / Rule |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Server Components for layout/initial shell; Client Components for interactive tutoring, exams, and forms. |
| **Language** | TypeScript 5+ (`strict: true`) | Zero `any` types allowed. API types generated from OpenAPI schema. |
| **Styling** | Tailwind CSS + Design Tokens | CSS variables mapped to the academic design system (`docs/design-system/design-principles.md`). |
| **Server State** | TanStack Query v5 | All API data fetching, caching, optimistic updates, and polling. |
| **Client UI State** | Zustand (lightweight, scoped) | Only for ephemeral UI state (e.g., active exam question drawer, tutor workspace pane toggles, active child selection in Parent Portal). |
| **Forms & Validation** | React Hook Form + Zod | Client-side validation schemas mirrored with backend `FormRequest` rules. |
| **Math Rendering** | KaTeX (`react-katex` / `rehype-katex`) | Fast, accessible rendering of algebraic, geometric, and scientific equations alongside Bangla text. |
| **Real-Time** | Laravel Echo + Pusher-js (Reverb) | WebSocket subscriptions for live tutoring turns, exam timers, and group study sessions. |

---

## 2. Feature-First Directory Structure

Do not dump hundreds of components into a single flat `src/components/` directory. Organize by domain feature under `src/features/`:

```text
apps/web/
├── src/
│   ├── app/                                # Next.js App Router (Routing & Layouts ONLY)
│   │   ├── (public)/                       # Landing, pricing, login, register, guardian consent verify
│   │   ├── (student)/                      # Student portal routes (/dashboard, /tutor, /study-plan, /exams, /materials, /progress)
│   │   ├── (guardian)/                     # Parent portal routes (/parent/dashboard, /parent/children, /parent/reports, /parent/billing)
│   │   └── (admin)/                        # Admin & Reviewer CMS (/admin/curriculum, /admin/content, /admin/questions, /admin/ai-review)
│   ├── components/                         # Shared, domain-agnostic Design System primitives ONLY
│   │   ├── ui/                             # Button, Input, Select, Modal, Badge, Tabs, Card, DataTable
│   │   ├── layout/                         # AppShell, Topbar, Sidebar, RoleGuard, ChildSwitcher
│   │   └── math-bangla/                    # Mixed Bangla + KaTeX renderer, Bengali Numeral formatter
│   ├── features/                           # Domain feature modules (Self-contained)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── curriculum/
│   │   ├── study-plans/
│   │   ├── tutor/                          # 3-Pane Academic Learning Workspace, state-driven cards, hint controls
│   │   ├── materials/
│   │   ├── examinations/                   # Timed exam runner, question palette, script uploader, rubric feedback viewer
│   │   ├── analytics/
│   │   ├── calendar/
│   │   ├── group-learning/
│   │   ├── gamification/
│   │   ├── guardian-portal/
│   │   ├── subscriptions/
│   │   └── admin-cms/
│   ├── hooks/                              # Global shared hooks (useDebounce, useActiveStudyHeartbeat, useReverbChannel)
│   ├── lib/                                # Configured singletons (query-client.ts, echo.ts, katex-config.ts, utils.ts)
│   ├── services/                           # Centralized HTTP API client & OpenAPI generated types
│   │   ├── api-client.ts
│   │   └── generated/                      # Auto-generated TypeScript types from backend OpenAPI spec
│   ├── types/                              # Global shared TypeScript interfaces
│   └── styles/                             # globals.css, Tailwind tokens, Bangla font face declarations
```

### Anatomy of a Feature Module (`src/features/tutor/`)
```text
src/features/tutor/
├── api/
│   ├── tutor.api.ts                        # Typed API functions calling src/services/api-client.ts
│   └── tutor.queries.ts                    # TanStack Query hooks (useTutorSession, useSubmitTurnMutation)
├── components/
│   ├── TutorWorkspaceLayout.tsx            # 3-Pane Desktop / Focused Tabbed Mobile workspace
│   ├── LessonProgressionSidebar.tsx        # Left pane: curriculum tree & 7-step stage indicator
│   ├── ConceptStageCanvas.tsx              # Center pane: textbook explanation, worked example, diagrams
│   ├── InteractiveQuestionCard.tsx         # Center/Bottom: structured question card, math input, hint drawer
│   ├── ContextualTutorSidebar.tsx          # Right pane: guided dialogue & quick action buttons
│   └── TutorActionToolbar.tsx              # "সহজ করে বোঝাও", "উদাহরণ দাও", "ইঙ্গিত দাও (Hint)"
├── hooks/
│   └── useTutorStateMachineUI.ts
├── schemas/
│   └── tutor-turn.schema.ts                # Zod validation for student answer submission
└── types/
    └── tutor.types.ts
```

---

## 3. Mandatory Frontend Engineering Rules

1. **No Raw `fetch()` in Components**:
   - Components must never call `fetch()` or `axios` directly. All network requests go through `src/services/api-client.ts` (which handles Bearer/Sanctum tokens, 401 refresh, correlation IDs, and standardized error parsing) wrapped in TanStack Query hooks inside `features/<feature>/api/`.

2. **Mixed Bangla + English + Math Rendering (`<MathBanglaText />`)**:
   - Every string containing educational explanations, questions, options, or rubric feedback must be rendered through the shared `<MathBanglaText content={...} />` component, which normalizes Unicode NFC, renders inline (`$...$`) and block (`$$...$$`) LaTeX via KaTeX, and applies optimal line-height (`1.75`) for Bangla conjunct characters (*যুক্তবর্ণ*).

3. **Active Study Time Heartbeat (`useActiveStudyHeartbeat`)**:
   - Learning routes (`/tutor/*`, `/materials/*`, `/exams/*`) must mount `useActiveStudyHeartbeat()`, which listens to DOM interaction events (`keydown`, `pointerdown`, `scroll`) and dispatches active duration heartbeats every 30s, automatically pausing after 120s of idle time.

4. **Resilient Exam Autosave**:
   - During timed examinations, selecting an MCQ option or typing a short answer immediately persists to `IndexedDB / localStorage` and debounces an idempotent PATCH to `/api/v1/attempts/{attemptId}/autosave`. If the student's internet drops momentarily, a non-intrusive banner shows `"অফলাইনে উত্তর সংরক্ষিত হয়েছে — সংযোগ ফিরলে সিঙ্ক হবে"` and automatically flushes the queue before final submission.

5. **Role & Consent Route Guards**:
   - Student routes verify active guardian consent (`consent_status === 'verified'`); if pending, render the `<GuardianConsentPendingBanner />` with a one-click "Resend SMS to Guardian" action.

