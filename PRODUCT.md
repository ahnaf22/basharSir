# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the student.** A Bangladeshi Class 6–8 student on the Bangla-medium NCTB syllabus (pilot: Rafi, Class 8), studying Mathematics first and Science second, usually in the evening on a phone. They get stuck on topics such as algebra and need step-by-step help in Bangla without waiting for a human tutor. They study at their own pace for school term exams.

**Second first-class audience: the parent or guardian.** They pay, give legal consent for under-18 accounts, and want visibility into whether the child really understands weak topics (pilot persona: Mrs. Nasreen, who currently pays BDT 4,000–8,000/month for coaching). They use a separate parent portal for progress summaries, consent and billing via bKash, Nagad and SSLCommerz.

Also in the product brief but not yet designed for on the web app: NCTB teacher and content reviewers, who approve curriculum, rubrics and flagged AI responses through an admin CMS.

## Product Purpose

AI Home Tutor Bangladesh replicates the core jobs of a dedicated private tutor: **teach** (stateful, step-by-step Bangla lessons), **plan** (adaptive study routines), **practice** (exercises, MCQs, creative questions), **evaluate** (rubric-graded exams and handwritten scripts) and **mentor** (mastery tracking, streaks, next-step advice for student and parent).

Launch scope is Classes 6–8 Bangla Medium, then Classes 9–10 (SSC), then Classes 1–5. Success means a student actually masters NCTB objectives, and a parent can see that happening.

## Positioning

Every lesson, plan, exam and mastery record is grounded in a versioned NCTB curriculum (`curriculum_version_id` down to `learning_objective_id`), and mastery comes only from verified assessment evidence. Reading a note or finishing a chat never counts. A generic AI chatbot or a video-course site cannot truthfully make that claim.

## Operating Context

- Web app in `apps/web` (Next.js App Router, TypeScript, Tailwind, TanStack Query); a separate Flutter app and a Laravel `/api/v1` backend exist. The web client never duplicates backend business rules.
- Student web routes: home (`/home`), tutor, planner, materials, exams, scripts (handwritten-answer evaluation), analytics, group learning, teachers (booking), onboarding. Parent routes: dashboard, children and consent, billing.
- The student shell is a dark "study desk" with a sidebar, top bar and mobile tab bar. The visual reference is `apps/web/designs/Student-Dashboard.html`; the dashboard follows it closely.
- The AI Tutor is a finite-state pedagogical engine, not an open chat window. The tutor workspace is a 3-pane academic learning layout.
- Demo data comes from seeders. The frontend must not hardcode fake data.

## Capabilities and Constraints

- Bangla-first: UI copy and numerals default to Bangla, with proper Bangla typography and KaTeX for maths.
- Low-bandwidth and budget phones: pages must stay usable on slow mobile data and small, low-end Android screens.
- Child protection (from AGENTS.md, Bangladesh PDPA 2026): under-18 accounts need verified guardian linking and consent records. Students only ever see their own data. PII is stripped before any external AI call.
- Rubric-bound evaluation: objective answers are graded in code. Written and handwritten answers are graded against structured rubrics with a confidence score and a human-review fallback.
- Not confirmed as a formal requirement: a WCAG conformance level. Record it here if one is chosen later.

## Brand Commitments

- Product wordmark in the shell: "পড়া হবে!" (Pora Hobe), with a marigold "প" mark.
- Voice is a warm, direct Bangla tutor addressing the student as "তুমি".
- The visual world for the student shell is already set by the Student-Dashboard design. New work extends it and does not replace it unless asked.

## Evidence on Hand

- Product docs: `docs/product/product-brief.md`, `docs/design-system/design-principles.md`, `docs/ai/`.
- Seeded demo student (phone `+8801712000001`) with curriculum, entitlements and a study plan, for local verification only.
- There are no real testimonials, customer counts, benchmarks or published pricing. Do not invent any.

## Product Principles

1. **Curriculum before AI:** anything a student sees about learning traces back to an NCTB chapter, topic or objective.
2. **Mastery is earned, not displayed:** show progress only from verified assessment evidence, never from time spent or lessons opened.
3. **A tutor, not a chatbot:** guide the student through structured steps, hints and checks, not an open-ended conversation.
4. **Two audiences, two jobs:** the student gets focus and momentum, the parent gets clarity and control. Neither experience leaks into the other.
5. **Honest empty states:** with no real data, say so plainly and point to the next action. Never fill the screen with fake numbers.
