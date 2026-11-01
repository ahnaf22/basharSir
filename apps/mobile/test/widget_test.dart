import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:basharsir_mobile/app/app.dart';
import 'package:basharsir_mobile/core/storage/offline_cache_store.dart';
import 'package:basharsir_mobile/core/theme/academic_theme.dart';

void main() {
  test('Chunk 4.1: formats Bangla numerals and manages offline cache store', () {
    expect(toBanglaNumerals(2026), equals('২০২৬'));
    expect(toBanglaNumerals('85%'), equals('৮৫%'));

    final store = OfflineCacheStore();
    store.saveOfflineExamAnswer(
      attemptId: 901,
      questionId: 101,
      answerValue: '13',
    );
    expect(store.getPendingExamDrafts(901).length, equals(1));

    final syncedCount = store.markAllDraftsSynced(901);
    expect(syncedCount, equals(1));
    expect(store.getPendingExamDrafts(901).length, equals(0));
  });

  testWidgets(
    'Chunks 4.2 - 4.6: renders 3-mode AI Tutor, caches offline NCTB notes, tracks heartbeat, syncs offline exam queue, and verifies OTP/PDPA consent',
    (WidgetTester tester) async {
      final cacheStore = OfflineCacheStore();
      await tester.pumpWidget(HomeTutorMobileApp(cacheStore: cacheStore));

      // Chunk 4.4: AI Tutor 3-Mode Tabbed Workspace
      expect(find.byKey(const Key('mobile-tutor-stage-badge')), findsOneWidget);
      expect(find.textContaining('EXPLAIN_CONCEPT'), findsOneWidget);

      await tester.tap(find.byKey(const Key('tutor-tab-practice')));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('mobile-tutor-answer-input')),
        '5x',
      );
      await tester.tap(find.byKey(const Key('mobile-tutor-submit-btn')));
      await tester.pumpAndSettle();

      expect(find.textContaining('MINI_ASSESSMENT'), findsOneWidget);
      expect(find.textContaining('দক্ষতা: ৭৬%'), findsOneWidget);

      // Chunk 4.3: Offline Study Materials Reader
      await tester.tap(find.byKey(const Key('nav-materials')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('download-offline-note-btn')));
      await tester.pumpAndSettle();
      expect(cacheStore.getCachedChapter(401), isNotNull);
      expect(find.text('অফলাইনে সংরক্ষিত'), findsOneWidget);

      // Chunk 4.5: Study Planner & Active Study Heartbeat
      await tester.tap(find.byKey(const Key('nav-planner')));
      await tester.pumpAndSettle();

      expect(find.textContaining('১৫ মিনিট (৯০০ সেকেন্ড)'), findsOneWidget);
      await tester.tap(find.byKey(const Key('trigger-heartbeat-ping-btn')));
      await tester.pumpAndSettle();
      expect(find.textContaining('৯৩০ সেকেন্ড'), findsOneWidget);

      await tester.tap(find.byKey(const Key('mobile-rebalance-plan-btn')));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('mobile-rebalanced-banner')), findsOneWidget);

      // Chunk 4.6: Timed Exam Offline Answer Queue & Parent Portal
      await tester.tap(find.byKey(const Key('nav-exams')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('mobile-exam-opt-13')));
      await tester.pumpAndSettle();
      expect(cacheStore.getPendingExamDrafts(901).length, equals(1));

      await tester.tap(find.byKey(const Key('mobile-exam-sync-btn')));
      await tester.pumpAndSettle();
      expect(cacheStore.getPendingExamDrafts(901).length, equals(0));

      expect(
        find.byKey(
          const Key('mobile-parent-portal-summary'),
          skipOffstage: false,
        ),
        findsOneWidget,
      );

      // Chunk 4.2: Mobile Auth, 6-Digit OTP & PDPA Consent
      await tester.tap(find.byKey(const Key('nav-auth')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('send-otp-btn')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('verify-otp-btn')));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('otp-verified-badge')), findsOneWidget);

      // Module 08: Mobile Group Study / Batch Tutoring Room
      await tester.tap(find.byKey(const Key('nav-group-study')));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('mobile-group-cohort-badge')), findsOneWidget);
      await tester.ensureVisible(find.byKey(const Key('mobile-submit-broadcast-btn')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('mobile-submit-broadcast-btn')));
      await tester.pumpAndSettle();
      expect(
        find.byKey(const Key('mobile-broadcast-reveal-banner'), skipOffstage: false),
        findsOneWidget,
      );

      await tester.ensureVisible(find.byKey(const Key('mobile-toggle-side-help-btn')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('mobile-toggle-side-help-btn')));
      await tester.pumpAndSettle();
      expect(
        find.byKey(const Key('mobile-individual-side-help-box'), skipOffstage: false),
        findsOneWidget,
      );
    },
  );
}
