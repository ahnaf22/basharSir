# Product Brief — AI Home Tutor Bangladesh

## 1. Executive Summary & Product Definition

**AI Home Tutor Bangladesh** is an intelligent, personalized digital home tutoring ecosystem designed specifically for Bangladeshi students. Unlike generic AI chatbots or static video-course platforms, it replicates the core responsibilities of a dedicated human private tutor:

| Core Responsibility | System Capability |
| :--- | :--- |
| **Teach** | Explains lessons step by step in age-appropriate Bangla, aligned strictly with NCTB textbooks, checking prerequisites before advancing. |
| **Plan** | Creates and dynamically adapts personalized study schedules based on selected chapters, target exam dates, daily study hours, and mastery gaps. |
| **Practice** | Provides topic-wise exercises, homework, MCQs, short-answer problems, mathematical problem-solving, and creative questions (*সৃজনশীল প্রশ্ন*). |
| **Evaluate** | Grades objective and written/handwritten answers against structured marking rubrics, identifying misconceptions and explaining corrections. |
| **Mentor** | Tracks evidence-based mastery per learning objective, monitors study consistency, and advises students and parents on what to study next. |

---

## 2. Target Market & Rollout Strategy

### 2.1 Market Parameters
- **Geography**: Bangladesh
- **Education System**: National Curriculum and Textbook Board (NCTB)
- **Initial Medium**: Bangla Medium (expanding later to English Version, English Medium, and Madrasa)
- **Target Grades**: Classes 1–10 (Primary & Secondary)
- **Platforms**: Web Application (Next.js) + Mobile Applications (Flutter for Android & iOS)

### 2.2 Phased Academic Rollout
While the database and curriculum architecture support **Classes 1–10** from Day 1, content and market launch follow a disciplined rollout:
1. **Pilot / MVP Launch (Phase 1–3)**: **Classes 6, 7, and 8 (Bangla Medium)** — starting with **Mathematics** (*গণিত*) first, and **Science** (*বিজ্ঞান*) second.
   - *Rationale*: Classes 6–8 represent the ideal middle ground to validate interactive conceptual teaching, algebraic/scientific reasoning, and personalized study planning before taking on high-stakes SSC board exam preparation.
2. **Expansion Wave 1**: **Classes 9–10 (SSC)** — full board-examination patterns, creative question (*সৃজনশীল*) script evaluation, and Physics/Chemistry/Higher Math/Biology/English.
3. **Expansion Wave 2**: **Classes 1–5 (Primary)** — highly visual, gamified, voice-assisted, short-attention-span tutoring.

---

## 3. Core Strategic Decisions

### 3.1 Curriculum-First, Never AI-First
The platform does **not** rely on an LLM's general training knowledge to teach or evaluate. All tutoring, study plans, questions, and evaluations are grounded in a **version-controlled NCTB Academic Curriculum Hierarchy**:
`Academic Year` → `Curriculum Version` → `Education Level` → `Class` → `Subject` → `Chapter` → `Topic` → `Learning Objective` → `Approved Content / Rubrics`.

Because NCTB periodically revises syllabuses, question patterns, and mark distributions (e.g., 2026 vs. 2027 revisions), every student enrollment, exam attempt, and progress report is immutably tied to its specific `curriculum_version_id`.

### 3.2 Evidence-Based Mastery vs. Content Consumption
Watching or reading a lesson never equates to mastery. The backend `MasteryCalculationService` computes mastery per `LearningObjective` strictly from verified assessment performance (prerequisite checks, guided practice, mini-assessments, and timed exams), adjusted for hint usage, difficulty, and recency.

### 3.3 Dual-Customer Design (Student User + Parent Buyer)
In Bangladesh, the **student** is the primary daily user, while the **parent/guardian** is the primary financial decision-maker and legal consent holder (under Bangladesh's **Personal Data Protection Act, 2026**). Both experiences are first-class priorities.

---

## 4. User Personas

1. **Rafi (Student, Class 8, Bangla Medium)**:
   - Wants clear explanations in Bangla when stuck on Algebra (*বীজগণিত*) or Geometry (*জ্যামিতি*) at 9 PM without waiting for a home tutor.
   - Needs interactive step-by-step hints rather than a wall of text, and wants to prepare for school term exams at his own pace.
2. **Mrs. Nasreen (Parent / Guardian)**:
   - Pays BDT 4,000–8,000/month for private coaching/tutors but lacks visibility into whether her child actually understands weak topics.
   - Wants weekly Bangla/English progress summaries, exam readiness scores, missed-schedule alerts, and simple subscription billing via **bKash / Nagad / SSLCommerz**.
3. **Ustad / Master Reviewer (NCTB Teacher & Academic Content Reviewer)**:
   - Reviews and approves curriculum trees, lesson notes, worked examples, marking rubrics, and flagged AI responses via the Admin CMS.
4. **Platform Administrator**:
   - Manages academic years, curriculum versions, subscription plans, AI model routing, token cost budgets, and PDPA 2026 audit compliance.

---

## 5. Business Model & Monetization

### 5.1 B2C Subscription Tiers (Paid via bKash, Nagad, SSLCommerz)

| Plan | Target User | Key Features & Quotas |
| :--- | :--- | :--- |
| **Free (Trial)** | New Students | 1–2 sample chapters per subject, limited daily AI tutor turns, basic topic quizzes. |
| **Basic** | Single Student | Full Class 6–8 Mathematics & Science curriculum, personalized study planner, daily AI tutoring (standard quota), chapter MCQ & short-answer exams, weekly parent report. |
| **Premium** | Exam-Focused Student | High AI tutoring quota, full model examinations, creative question (*সৃজনশীল*) rubric evaluation, handwritten script OCR uploads, detailed weakness analytics & PDF exports. |
| **Family** | Multi-Child Households | Up to 3 student profiles under 1 Guardian account with consolidated parent dashboard and discounted family billing. |

### 5.2 Unit Economics & AI Usage Ledger
Every AI interaction records token counts, provider/model ID, latency, and estimated USD/BDT cost in the `usage_ledger` and `ai_usage_logs` tables. Subscriptions enforce hard and soft daily/monthly token quotas with automatic model routing (e.g., lightweight models for simple drills, frontier models for misconception diagnosis and rubric grading) to protect gross margins.

---

## 6. Success Metrics & KPIs

### North Star Metric
> **Verified Learning Improvement per Active Student per Month**
> *(Measured as the net gain in evidence-based Learning Objective mastery scores across active chapters within a 30-day window).*

### Supporting KPIs

| Category | Metric | Target / Definition |
| :--- | :--- | :--- |
| **Acquisition** | Verified Student + Guardian Registrations | Monthly new student accounts with completed guardian consent |
| **Activation** | First Lesson & Mini-Assessment Completion | % of registered students completing 1 full stateful tutoring session within 48h |
| **Engagement** | Weekly Active Learners (WAL) & Study Consistency | % of active students completing ≥ 3 scheduled study plan tasks per week |
| **Learning Quality** | Prerequisite-to-Post-Lesson Mastery Delta | Average mastery score improvement after completing guided practice + mini-assessment |
| **Assessment Accuracy** | AI-to-Teacher Grading Agreement | Cohen's kappa / correlation between AI rubric grading and human teacher benchmarks (≥ 90%) |
| **Parent Value** | Weekly Parent Report Open & Retention Rate | % of guardians viewing weekly progress reports and renewing monthly subscriptions |
| **Financial Health** | AI Cost as % of Subscription Revenue | Monthly AI compute + OCR cost per active subscriber kept ≤ 18% of ARPU |

