# Flutter Mobile Architecture & Conventions

This document defines the architecture, state management, offline synchronization, and coding standards for the **Flutter (`apps/mobile/`)** Android and iOS applications.

---

## 1. Core Mobile Technology Stack

| Layer | Package / Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Flutter (Latest Stable) + Dart 3 | Cross-platform Android & iOS native compilation. |
| **State Management** | `flutter_riverpod` + `riverpod_annotation` | Reactive, testable state management and dependency injection. |
| **Navigation** | `go_router` | Deep-linkable declarative routing with auth and consent guards. |
| **Networking** | `dio` + `retrofit` (optional) | HTTP client with interceptors for auth tokens, retry with exponential backoff, and Gzip compression. |
| **Local Database** | `drift` (SQLite) or `isar` | Structured offline caching for study plans, chapter notes, draft exam answers, and pending sync queues. |
| **Secure Storage** | `flutter_secure_storage` | Encrypted storage for auth tokens and active child/student context. |
| **Math & Bangla** | `flutter_math_fork` + `Noto Sans Bengali` | Native rendering of LaTeX mathematical formulas alongside Bangla script. |
| **Image & Camera** | `image_picker` + `image_cropper` + `flutter_image_compress` | Capturing, deskewing, cropping, and compressing handwritten answer scripts before upload. |
| **Push Notifications** | `firebase_messaging` + `flutter_local_notifications` | Study reminders, missed-schedule alerts, and weekly parent report notifications. |

---

## 2. Feature-First Directory Structure

```text
apps/mobile/
├── lib/
│   ├── app/
│   │   ├── app.dart                        # MaterialApp.router configuration
│   │   └── bootstrap.dart                  # Initialization (DB, Riverpod ProviderScope, Crashlytics)
│   ├── core/
│   │   ├── network/                        # Dio client, AuthInterceptor, RetryInterceptor, ConnectivityService
│   │   ├── routing/                        # GoRouter configuration & role/consent redirects
│   │   ├── theme/                          # Academic color tokens, Bangla typography scale
│   │   ├── storage/                        # Drift SQLite database & SyncQueueManager
│   │   └── localization/                   # Bangla (bn_BD) primary & English (en_US) ARB files
│   ├── features/
│   │   ├── authentication/                 # OTP login, student registration, guardian linking
│   │   ├── dashboard/                      # Student & Guardian home dashboards
│   │   ├── curriculum/                     # Class, Subject, Chapter & Topic browser
│   │   ├── study_planner/                  # Personalized schedule, task completion, rescheduling
│   │   ├── ai_tutor/                       # Focused mobile tutoring workspace, structured question cards, hints
│   │   ├── materials/                      # Offline-capable lesson notes, formula sheets, PDF viewer
│   │   ├── examination/                    # Timed exam runner, camera script scanner, rubric feedback viewer
│   │   ├── progress/                       # Mastery radar/bar charts, topic breakdown, parent reports
│   │   └── subscriptions/                  # bKash / Nagad / SSLCommerz WebView/DeepLink checkout
│   └── shared/
│       ├── widgets/                        # MathBanglaRichText, AcademicCard, OfflineStatusBanner
│       └── utils/
```

---

## 3. Bangladesh Low-Bandwidth & Offline-First Engineering Rules

Given mobile data constraints and intermittent 3G/4G connectivity across Bangladesh, the Flutter app must adhere to strict resilience standards:

1. **Offline-Available Study Materials & Study Plans**:
   - Whenever a student opens a chapter or study plan, `LessonNotes`, `FormulaSheets`, `KeyDefinitions`, and the next 7 days of `StudyPlanItems` are cached locally in SQLite (`drift`).
   - Students can read chapter notes, review worked examples, and view their daily study schedule with **zero internet connection**.

2. **Tutor Session Resume & Turn Idempotency**:
   - Every student turn submission includes a client-generated UUID (`client_turn_id`).
   - If a mobile network drop occurs after sending an answer to the AI Tutor, the app retries with the same `client_turn_id` so the backend returns the cached turn response without double-billing tokens or corrupting session state.

3. **Offline Draft Persistence for Examinations**:
   - During an exam, every MCQ selection and typed short answer is written synchronously to local SQLite before attempting a background network autosave.
   - If connectivity drops mid-exam, the student can continue answering questions uninterrupted; queued answers sync automatically as soon as connectivity returns.

4. **Resumable & Compressed Handwritten Script Upload**:
   - Camera captures of handwritten scripts (often 5–8 MB raw photos) are preprocessed on-device into high-contrast grayscale/color WebP/JPEG (`<= 450 KB` per page at 1600px max dimension) after interactive cropping and blur detection.
   - Pages upload sequentially with per-page checksums and background retry (`Workmanager`), ensuring a failed upload on page 4 of 5 only retries page 4.

5. **Single Source of Business Truth**:
   - The Flutter app **never** calculates mastery percentages, grades written answers locally, or invents study plan schedules. All domain intelligence resides in the Laravel `/api/v1` backend.

