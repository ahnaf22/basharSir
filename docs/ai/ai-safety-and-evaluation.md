# AI Safety, Rubric Evaluation & Child Data Protection (PDPA 2026)

This document defines the engineering controls for **Rubric-Based Answer Evaluation**, **Handwritten Script OCR**, **Child Safety Guardrails**, and compliance with **Bangladesh's Personal Data Protection Act, 2026 (Act No. 63 of 2026)**.

---

## 1. Rubric-Bound Answer Evaluation Engine

### 1.1 Zero Unbounded LLM Grading
An AI model is **never** permitted to assign marks to a student's examination or practice answer without a structured `MarkingRubric` retrieved from the database.

### 1.2 Three-Tier Evaluation Strategy

1. **Tier 1 — Deterministic Code Evaluation (Zero AI Cost, 100% Precision)**:
   - Used for: Single MCQ, Multi-statement NCTB MCQ (*বহুপদী সমাপ্তিসূচক*), True/False, Matching, Fill-in-the-blank, and canonical numeric/symbolic answers.
   - Normalizes Bangla numerals (`০-৯` $\leftrightarrow$ `0-9`), trims Unicode whitespace, and checks algebraic equivalence (e.g., `2x + 3` $\equiv$ `3 + 2x`).

2. **Tier 2 — Structured Rubric AI Evaluation (Typed Short Answer & Creative *সৃজনশীল*)**:
   - Each question in `questions` has a 1-to-1 `marking_rubrics` record containing:
     ```json
     {
       "total_marks": 4.0,
       "steps": [
         {
           "step_id": "S1",
           "description_bn": "দেওয়া আছে মানগুলো সঠিকভাবে লেখা ($a + b = 7, ab = 12$)",
           "marks": 1.0,
           "required_expressions": ["a+b=7", "ab=12"]
         },
         {
           "step_id": "S2",
           "description_bn": "অনুসিদ্ধান্ত সূত্র প্রয়োগ: $(a - b)^2 = (a + b)^2 - 4ab$",
           "marks": 1.5,
           "accepted_alternatives": ["a^2 + b^2 নির্ণয় করে পরবর্তীতে (a-b)^2 নির্ণয়"]
         },
         {
           "step_id": "S3",
           "description_bn": "মান বসিয়ে সঠিক উত্তর নির্ণয় ($49 - 48 = 1 \\Rightarrow a - b = \\pm 1$)",
           "marks": 1.5
         }
       ],
       "common_mistakes": [
         {
           "code": "SIGN_ERROR_IN_COROLLARY",
           "description_bn": "$-4ab$ এর পরিবর্তে $-2ab$ লেখা",
           "max_partial_marks_for_step": 0.0
         }
       ],
       "nctb_reference": "অষ্টম শ্রেণি গণিত, পৃষ্ঠা ৫২, অনুশীলনী ৪.১"
     }
     ```
   - `AnswerEvaluatorService` evaluates the student's response against each step in `steps`, returning a structured JSON breakdown with `marks_awarded`, `missing_points_bn`, `calculation_errors_bn`, `improvement_tip_bn`, and `confidence_score` ($0.00 - 1.00$).

3. **Tier 3 — Handwritten Script OCR & Provisional Grading Pipeline (Phase 5)**:
   - **Image Quality Gate**: Rejects blurry or unreadable photos immediately on upload with a Bangla prompt to retake the photo.
   - **Multimodal Extraction**: Recognizes handwritten Bangla prose, English terms, and mathematical steps into structured LaTeX + Bangla blocks with per-line confidence.
   - **Student Verification Step (Optional / Configurable)**: For practice exams, allows the student to fix any misread character before grading.
   - **Confidence Gate & Provisional Status**:
     - If `ocr_confidence >= 0.85` AND `rubric_confidence >= 0.80` $\rightarrow$ Marks result as `provisional_graded` (clearly badged as *"এআই কর্তৃক প্রাথমিক মূল্যায়ন"*).
     - If either confidence is below threshold OR the student clicks **"পুনর্বিবেচনার আবেদন (Request Recheck)"** $\rightarrow$ Routes to the human `AcademicReviewer` queue (`flagged_for_human`).

---

## 2. Child Protection & Bangladesh PDPA 2026 Compliance

Under **Bangladesh's Personal Data Protection Act, 2026 (Act No. 63 of 2026)**, any user under 18 is legally a child, requiring verifiable parent/guardian consent and strict data minimization.

### 2.1 Mandatory Privacy & Consent Controls
1. **Verifiable Guardian Consent (`consent_records`)**:
   - During student onboarding, an OTP-verified link is sent to the parent/guardian's mobile number.
   - The guardian reviews a clear Bangla & English summary of:
     - What data is collected (learning progress, quiz answers, study time, uploaded exam scripts).
     - How AI processes learning interactions to personalize lessons.
     - Right to inspect data, export academic history, or withdraw consent at any time.
2. **PII Redaction & Pseudonymization Before External AI Calls**:
   - The `AIOrchestrator` **never** transmits a student's real name, phone number, school name, home address, or guardian details to external LLM providers (OpenAI, Google Gemini, Anthropic).
   - Prompts only include an ephemeral session token, `grade_level` (e.g., `Class 8`), `medium` (`Bangla`), and academic mastery state.
   - Handwritten script images undergo header cropping / masking so top-of-page student name/roll boxes are stripped before calling external Vision OCR APIs.
3. **Private-by-Default Profiles & Access Auditing**:
   - All student profiles are strictly private by default.
   - Any administrative access to a student's learning log or answer script for support/review is logged immutably in `admin_audit_logs` (`actor_id`, `student_id`, `reason`, `ip_address`, `timestamp`).
4. **Data Retention & Right to Erasure**:
   - Guardians can trigger account deletion or consent withdrawal from the Parent Portal, which immediately revokes external AI processing, purges S3 handwritten script images within 7 days, and anonymizes historical telemetry.

---

## 3. Pedagogical & Child AI Safety Guardrails

1. **Input & Output Content Moderation**:
   - Pre-flight and post-flight filters block self-harm, violence, adult content, political/religious controversy, cyberbullying, and non-academic off-topic chat.
   - If a student attempts to steer the AI Tutor off-topic, the tutor gently redirects in Bangla:
     *"আমি তোমার পড়াশোনার সহকারী গৃহশিক্ষক। চলো আমরা আবার আজকের অধ্যায়ের পাঠে ফিরে যাই!"*
2. **No External Unverified Links**:
   - The AI Tutor is forbidden from outputting external URLs or YouTube links. It may only reference internal published `learning_resources` and official NCTB textbook chapters/pages.
3. **Anti-Cheating / Homework Integrity Mode**:
   - If a student pastes a problem and asks *"শুধু উত্তরটা লিখে দাও (Just give me the final answer)"*, the `TutorEngineService` refuses to dump the final solution and instead initiates the `ASK_STUDENT_QUESTION` / `HINT` scaffolding loop so the student learns how to solve it.
4. **One-Click Hallucination & Error Escalation**:
   - Every AI Tutor message and rubric evaluation card displays a subtle **"তথ্যটি ভুল মনে হচ্ছে? রিপোর্ট করো"** button, sending the exact prompt, RAG context chunks, and model output to the Admin AI Quality Queue.

