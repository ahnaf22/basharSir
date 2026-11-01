import 'package:flutter/material.dart';
import '../../../core/storage/offline_cache_store.dart';
import '../../../core/theme/academic_theme.dart';
import '../../../shared/widgets/math_bangla_rich_text.dart';

class MobileTimedExamAndParentScreen extends StatefulWidget {
  final OfflineCacheStore cacheStore;

  const MobileTimedExamAndParentScreen({
    super.key,
    required this.cacheStore,
  });

  @override
  State<MobileTimedExamAndParentScreen> createState() =>
      _MobileTimedExamAndParentScreenState();
}

class _MobileTimedExamAndParentScreenState
    extends State<MobileTimedExamAndParentScreen> {
  static const int _attemptId = 901;
  bool _isOffline = true;
  String? _selectedMcqOption;
  bool _examSubmitted = false;

  void _selectMcqAnswer(String optionKey) {
    setState(() {
      _selectedMcqOption = optionKey;
      widget.cacheStore.saveOfflineExamAnswer(
        attemptId: _attemptId,
        questionId: 101,
        answerValue: optionKey,
      );
    });
  }

  void _reconnectAndSyncQueue() {
    setState(() {
      _isOffline = false;
      widget.cacheStore.markAllDraftsSynced(_attemptId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount =
        widget.cacheStore.getPendingExamDrafts(_attemptId).length;

    return Column(
      children: [
        OfflineStatusBanner(
          isOffline: _isOffline,
          pendingSyncCount: pendingCount,
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        alignment: WrapAlignment.spaceBetween,
                        spacing: 12,
                        runSpacing: 6,
                        children: [
                          const Text(
                            'সময়বদ্ধ পরীক্ষা (অফলাইন উত্তর সংরক্ষণ সহ)',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AcademicColors.navyPrimary,
                            ),
                          ),
                          Text(
                            'বাকি সময়: ${toBanglaNumerals(24)}:০০',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AcademicColors.tealAccent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const MathBanglaRichText(
                        content:
                            r'প্রশ্ন ১: যদি $a + b = 5$ এবং $ab = 6$ হয়, তবে $a^2 + b^2$ এর মান কত?',
                      ),
                      const SizedBox(height: 8),
                      ...['11', '13', '19', '25'].map((opt) {
                        final isSelected = _selectedMcqOption == opt;
                        return ListTile(
                          key: Key('mobile-exam-opt-$opt'),
                          leading: Icon(
                            isSelected
                                ? Icons.radio_button_checked
                                : Icons.radio_button_off,
                            color: AcademicColors.tealAccent,
                          ),
                          title: Text(toBanglaNumerals(opt)),
                          onTap: () => _selectMcqAnswer(opt),
                        );
                      }),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          ElevatedButton(
                            key: const Key('mobile-exam-sync-btn'),
                            onPressed: _reconnectAndSyncQueue,
                            child: Text(
                              'অনলাইন সিঙ্ক করুন (অপেক্ষমাণ: ${toBanglaNumerals(pendingCount)})',
                            ),
                          ),
                          OutlinedButton(
                            key: const Key('mobile-exam-submit-btn'),
                            onPressed: () =>
                                setState(() => _examSubmitted = true),
                            child: const Text('পরীক্ষা জমা দিন'),
                          ),
                        ],
                      ),
                      if (_examSubmitted)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Text(
                            'রুব্রিক মূল্যায়ন সম্পন্ন: প্রাপ্ত নম্বর ${toBanglaNumerals(1)}/${toBanglaNumerals(1)} (১০০%)',
                            key: const Key('mobile-exam-result-banner'),
                            style: const TextStyle(
                              color: AcademicColors.emeraldSuccess,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Card(
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'অভিভাবক পোর্টাল সারসংক্ষেপ (Parent Portal Summary)',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AcademicColors.navyPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'রাফি আহমেদ — সাপ্তাহিক সক্রিয় পাঠ: ${toBanglaNumerals(145)} মিনিট • সার্বিক দক্ষতা: ${toBanglaNumerals(69)}%',
                        key: const Key('mobile-parent-portal-summary'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
