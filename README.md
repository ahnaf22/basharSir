# AI Home Tutor Bangladesh (`home-tutor-platform`)

An intelligent, personalized digital home tutor ecosystem for Bangladeshi students (Classes 1–10, starting with Classes 6–8 Bangla Medium in Mathematics and Science). Built around a **Curriculum-First (NCTB)** architecture and a **Stateful AI Tutoring Engine** that teaches step by step, plans study schedules, administers rubric-graded examinations, tracks evidence-based mastery, and empowers parents with actionable academic reporting.

---

## Core Product Pillars

| Responsibility | What the System Does |
| :--- | :--- |
| **Teach** | Explains lessons step by step in age-appropriate Bangla using a stateful pedagogical workflow, checking prerequisites and correcting misconceptions. |
| **Plan** | Generates and dynamically adapts personalized study plans based on selected NCTB chapters, available hours, target dates, and mastery gaps. |
| **Practice** | Delivers topic-wise exercises, MCQs, short answers, mathematical problems, and creative questions (*সৃজনশীল প্রশ্ন*). |
| **Evaluate** | Grades objective and written/handwritten answers against structured marking rubrics with confidence checks and textbook citations. |
| **Mentor** | Tracks objective-level mastery, study consistency, and learning streaks, recommending targeted remedial or advanced lessons next. |

---

## Monorepo Structure

```text
home-tutor-platform/
├── apps/
│   ├── web/                        # Next.js (App Router) + TypeScript + Tailwind CSS (Student, Parent, Admin)
│   └── mobile/                     # Flutter (Android & iOS) with offline caching & low-bandwidth support
├── backend/                        # Laravel Modular Monolith API, Queue Workers (Horizon), Real-time (Reverb)
├── docs/                           # Complete engineering, product, database, API, AI, and UX specifications
│   ├── product/
│   │   ├── product-brief.md
│   │   └── feature-specifications.md
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── backend-conventions.md
│   │   ├── frontend-conventions.md
│   │   └── mobile-conventions.md
│   ├── database/
│   │   └── database-design.md
│   ├── api/
│   │   └── api-conventions.md
│   ├── ai/
│   │   ├── ai-tutoring-engine.md
│   │   └── ai-safety-and-evaluation.md
│   ├── design-system/
│   │   └── design-principles.md
│   └── development/
│       └── development-roadmap.md
├── AGENTS.md                       # Global AI coding rules, architectural invariants, and workflow instructions
├── progress.md                     # Phasewise & chunk-by-chunk implementation progress tracker
└── README.md                       # Repository overview and documentation index
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Web Frontend** | Next.js (App Router) + TypeScript + Tailwind CSS | Student, Parent, and Admin web applications |
| **Mobile App** | Flutter + Dart + Riverpod + GoRouter + Dio | Android and iOS mobile-first, low-bandwidth experience |
| **Backend** | Laravel 11+ (Modular Monolith) | Central business logic, domain rules, and versioned REST APIs (`/api/v1`) |
| **Database** | MySQL 8.0+ | Primary relational database for curriculum, mastery, and transactional records |
| **Cache & Locks** | Redis | Caching, rate limiting, session state, and idempotency locks |
| **Queues** | Laravel Queue + Horizon | Async AI processing, OCR/handwriting evaluation, and PDF generation |
| **Real-Time** | Laravel Reverb | Group tutoring sessions, raise-hand queues, and live events |
| **Object Storage** | S3-Compatible Storage | Handwritten answer scripts, lesson diagrams, and PDF exports |
| **Search & RAG** | MySQL Full-Text + Vector Index (pgvector / Qdrant / Meilisearch) | Approved NCTB curriculum retrieval for AI grounding |
| **Payments** | bKash, Nagad, SSLCommerz | Local Bangladesh B2C subscription billing |

---

## Documentation Index

All architectural decisions, product requirements, and coding conventions are documented in [`docs/`](./docs):

1. **Governance & Agent Rules**: [`AGENTS.md`](./AGENTS.md)
2. **Product Vision & Brief**: [`docs/product/product-brief.md`](./docs/product/product-brief.md)
3. **Complete PRD & Feature Specifications**: [`docs/product/feature-specifications.md`](./docs/product/feature-specifications.md)
4. **System Architecture**: [`docs/architecture/system-architecture.md`](./docs/architecture/system-architecture.md)
5. **Laravel Backend Conventions**: [`docs/architecture/backend-conventions.md`](./docs/architecture/backend-conventions.md)
6. **Next.js Frontend Conventions**: [`docs/architecture/frontend-conventions.md`](./docs/architecture/frontend-conventions.md)
7. **Flutter Mobile Conventions**: [`docs/architecture/mobile-conventions.md`](./docs/architecture/mobile-conventions.md)
8. **Database Design & ERD**: [`docs/database/database-design.md`](./docs/database/database-design.md)
9. **API Conventions & Contracts**: [`docs/api/api-conventions.md`](./docs/api/api-conventions.md)
10. **AI Tutoring Engine & Mastery Spec**: [`docs/ai/ai-tutoring-engine.md`](./docs/ai/ai-tutoring-engine.md)
11. **AI Safety, Evaluation & PDPA 2026 Compliance**: [`docs/ai/ai-safety-and-evaluation.md`](./docs/ai/ai-safety-and-evaluation.md)
12. **UI/UX Design System & Bangla Typography**: [`docs/design-system/design-principles.md`](./docs/design-system/design-principles.md)
13. **Development Roadmap & Granular Phase-Chunk Backlog**: [`docs/development/development-roadmap.md`](./docs/development/development-roadmap.md)
14. **Live Phasewise Implementation Progress Tracker**: [`progress.md`](./progress.md)

