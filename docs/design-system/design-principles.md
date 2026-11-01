# UI/UX Design System & Academic Visual Standards

This document defines the design principles, color tokens, Bangla + English typography, mathematical rendering rules, and layout standards for **AI Home Tutor Bangladesh** across Web (`Next.js`) and Mobile (`Flutter`).

---

## 1. Core Design Philosophy

The platform is an **academic learning environment**, not a generic AI SaaS dashboard or a novelty chatbot. It must feel:
- **Trustworthy & Reassuring** for Bangladeshi parents investing in their child's education.
- **Calm, Focused & Distraction-Free** for students studying complex Mathematics and Science concepts.
- **Human-Designed & Structured**, avoiding AI-generated clichés.

### Strict Anti-Patterns (What Never to Do)
- **No ChatGPT-Style Chat Windows** for the AI Tutor (never make the primary learning screen a full-width scrolling chat log).
- **No Neon Cyberpunk Gradients or Heavy Glassmorphism**.
- **No Robot Mascots** or childish clip-art cluttering academic workspaces.
- **No Cramped Bangla Line Heights** that clip vowel diacritics (*কার* / *ফলা*).

---

## 2. Color System (Academic Navy & Muted Teal Palette)

| Token Name | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` (Warm Alabaster / Off-White) | Primary page background — reduces eye strain during long reading sessions |
| `--bg-surface` | `#FFFFFF` | Cards, lesson canvas, examination sheets |
| `--bg-subtle` | `#F1F5F9` | Secondary panels, curriculum sidebar, code/formula blocks |
| `--brand-primary` | `#0F2942` (Deep Academic Navy) | Primary navigation, headings, authority elements, primary buttons |
| `--brand-secondary` | `#0D9488` (Muted Pedagogical Teal) | Active lesson progress, interactive tutor highlights, guided focus |
| `--accent-warm` | `#D97706` (Warm Amber) | Streaks, hints, revision reminders, flagged exam questions |
| `--status-success` | `#15803D` (Emerald Green) | Mastered objectives ($\ge 75\%$), correct answers |
| `--status-warning` | `#B45309` (Amber) | Practicing / needs revision ($50\% - 74\%$) |
| `--status-danger` | `#B91C1C` (Crimson) | Struggling objectives ($< 50\%$), overdue tasks, misconception alerts |
| `--text-primary` | `#0F172A` (Slate 900) | Main body text and Bangla lesson content |
| `--text-secondary` | `#475569` (Slate 600) | Metadata, subtitles, textbook citations |
| `--border-subtle` | `#E2E8F0` (Slate 200) | Clean 1px structural dividers |

---

## 3. Bangla, English & Mathematical Typography

Because Bangla Medium students read mixed Bangla prose, English technical terms, and algebraic equations simultaneously, typography is treated as core educational infrastructure.

### 3.1 Font Stack
- **Bangla Primary UI & Reading Font**: `'Hind Siliguri'` (for clean UI headings/labels) paired with `'Noto Sans Bengali'` (for long-form lesson notes, creative questions, and high legibility of complex conjuncts/*যুক্তবর্ণ*).
- **English & Numerals Companion Font**: `'Plus Jakarta Sans'` or `'Inter'`.
- **Mathematics & Symbolic Notation**: `KaTeX_Main` / `KaTeX_Math` rendered via KaTeX.

### 3.2 Typographic Scale & Line-Height Rules
| Element | Desktop Size | Mobile Size | Line Height | Max Measure |
| :--- | :--- | :--- | :--- | :--- |
| **Lesson Title (H1)** | `28px` (`1.75rem`), SemiBold | `22px`, SemiBold | `1.45` | `65ch` |
| **Section Heading (H2)** | `22px` (`1.375rem`), SemiBold | `18px`, SemiBold | `1.50` | `65ch` |
| **Lesson Body (Bangla)** | `18px` (`1.125rem`), Regular | `16.5px`, Regular | **`1.80`** *(Crucial for Bangla)* | **`68ch`** |
| **Interactive Question Text** | `19px`, Medium | `17px`, Medium | `1.75` | `65ch` |
| **UI Labels & Badges** | `14px`, Medium | `13px`, Medium | `1.40` | — |

### 3.3 Numeral & Formula Coexistence Rules
- **Textbook Citations, Question Numbers, and Dates**: Render in Bangla numerals (`১, ২, ৩...`) using a deterministic formatter (`toBanglaNumerals()`).
- **Algebraic Variables & International Scientific Units**: Follow exact NCTB Class 6–10 convention (e.g., Class 8 Algebra uses Latin variables $x, y, a, b$ with standard numerals inside algebraic expressions like $3x^2 + 5x - 2 = 0$, while arithmetic word problems use Bangla numerals where appropriate).

---

## 4. Signature Screen Architecture: The AI Private Tutor Workspace

The AI Tutor screen is designed as an **interactive classroom desk and whiteboard**, never a generic chat thread.

### 4.1 Desktop Layout (3-Pane Academic Workspace)
```text
+--------------------------------------------------------------------------------------------------+
| Topbar: [Class 8 · গণিত] > [অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি]   [Stage: 4/7 অনুশীলন]  [Pause Lesson] |
+-----------------------+--------------------------------------------------+-----------------------+
| LEFT PANE (260px)     | CENTER PANE (Flexible — Primary Focus)           | RIGHT PANE (340px)    |
|                       |                                                  |                       |
| Curriculum & Steps    |  +--------------------------------------------+  | Tutor Guidance &      |
|                       |  | [NCTB Concept & Worked Example Board]      |  | Contextual Dialogue   |
| [✓] ১. পাঠ পরিচিতি     |  |                                            |  |                       |
| [✓] ২. পূর্বজ্ঞান যাচাই |  |  সূত্র ১: (a + b)² = a² + 2ab + b²         |  | গৃহশিক্ষক:             |
| [✓] ৩. মূল ধারণা ও সূত্র |  |  চিত্র ও জ্যামিতিক প্রমাণ...                 |  | "লক্ষ্য করো, এখানে     |
| [●] ৪. হাতে-কলমে অনুশীলন|  +--------------------------------------------+  |  2ab পদটিতে উভয় পদের  |
| [ ] ৫. দক্ষতা বৃদ্ধি     |                                                  |  গুণফলের দ্বিগুণ..."   |
| [ ] ৬. সংক্ষিপ্ত মূল্যায়ন |  +--------------------------------------------+  |                       |
| [ ] ৭. পাঠ সমাপ্তি      |  | [Active Interactive Question Card]         |  | [সহজ করে বোঝাও]       |
|                       |  |  প্রশ্ন: (2x + 3y)² এর বিস্তৃতি নির্ণয় করো।  |  | [আরেকটি উদাহরণ দাও]    |
| Topic Mastery: 62%    |  |  [ Answer Input / Math Keypad ]            |  | [ইঙ্গিত দাও (Hint 1/3)]|
| [========-----]       |  |  [ উত্তর জমা দাও (Submit Answer) ]          |  |                       |
+-----------------------+--------------------------------------------------+-----------------------+
```

### 4.2 Mobile Layout (Focused Single-Column Pedagogical Flow)
1. **Compact Sticky Header**: Chapter title + 7-step segmented progress bar + Pause button.
2. **Concept & Whiteboard Card**: Collapsible/expandable textbook explanation and worked example so the student can always reference the formula while solving a problem.
3. **Active Tutor Prompt & Question Card**: Highlighted card showing the current question, misconception feedback (if any), and expandable progressive Hint drawer.
4. **Bottom Action Dock**: Clean answer input bar + quick-tap pedagogical chips (`সহজ ব্যাখ্যা`, `উদাহরণ`, `ইঙ্গিত`).

