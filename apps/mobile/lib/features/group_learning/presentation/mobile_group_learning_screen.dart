import 'package:flutter/material.dart';
import '../../../core/theme/academic_theme.dart';
import '../../../shared/widgets/math_bangla_rich_text.dart';

class MobileGroupLearningScreen extends StatefulWidget {
  const MobileGroupLearningScreen({super.key});

  @override
  State<MobileGroupLearningScreen> createState() =>
      _MobileGroupLearningScreenState();
}

class _MobileGroupLearningScreenState extends State<MobileGroupLearningScreen> {
  String _selectedOption = 'B';
  bool _pollRevealed = false;
  bool _showIndividualSideHelp = false;

  final List<Map<String, String>> _raiseHandQueue = [
    {
      'pseudonym': 'ধ্রুবতারা-১০১',
      'question': 'পক্ষান্তর বিধি কখন প্রয়োগ করতে হয়?',
      'status': 'queued',
    },
    {
      'pseudonym': 'অনুসন্ধানী-২০৪',
      'question': 'ভগ্নাংশ যুক্ত সমীকরণ কীভাবে সরল করব?',
      'status': 'queued',
    },
  ];

  void _submitGroupBroadcastAnswer() {
    setState(() {
      _pollRevealed = true;
    });
  }

  void _resolveNextFifoHand() {
    setState(() {
      final idx = _raiseHandQueue.indexWhere((q) => q['status'] == 'queued');
      if (idx != -1) {
        _raiseHandQueue[idx]['status'] = 'answered';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AcademicColors.navyPrimary,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'আমন্ত্রণ কোড: GRP-8B-2026',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AcademicColors.tealAccent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        'সহপাঠী কোহর্ট: ${toBanglaNumerals(3)}/${toBanglaNumerals(5)} জন',
                        key: const Key('mobile-group-cohort-badge'),
                        style: const TextStyle(
                          color: AcademicColors.tealAccent,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'স্মল-গ্রুপ স্টাডি রুম (অষ্টম শ্রেণি • গণিত)',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AcademicColors.navyPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'শিশু সুরক্ষা (PDPA ২০২৬): ১-অন-১ চ্যাট বন্ধ • স্বয়ংক্রিয় PII গোপনকরণ সক্রিয়',
                  style: TextStyle(
                    fontSize: 12,
                    color: AcademicColors.emeraldSuccess,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Divider(height: 20),
                const MathBanglaRichText(
                  content:
                      r'যৌথ পাঠ বোর্ড: দ্বিপদী রাশির বর্গের সূত্র $(a + b)^2 = a^2 + 2ab + b^2$। এখানে মধ্যপদ হলো $2ab$।',
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Batch Mode Shared Broadcast Question Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ব্যাচ ব্রডকাস্ট প্রশ্ন (সবাই উত্তর দেওয়ার পর ফলাফল প্রকাশ):',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AcademicColors.navyPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const MathBanglaRichText(
                  content:
                      r'প্রশ্ন: $(2x + 3y)^2$ এর বিস্তৃতিতে মধ্যপদ ($2ab$) কোনটি?',
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('A: 6xy'),
                      selected: _selectedOption == 'A',
                      onSelected: (_) => setState(() => _selectedOption = 'A'),
                    ),
                    ChoiceChip(
                      label: const Text('B: 12xy'),
                      selected: _selectedOption == 'B',
                      onSelected: (_) => setState(() => _selectedOption = 'B'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ElevatedButton(
                      key: const Key('mobile-submit-broadcast-btn'),
                      onPressed: _submitGroupBroadcastAnswer,
                      child: const Text('একক উত্তর জমা দাও'),
                    ),
                    OutlinedButton(
                      key: const Key('mobile-toggle-side-help-btn'),
                      onPressed: () => setState(
                        () => _showIndividualSideHelp = !_showIndividualSideHelp,
                      ),
                      child: const Text('একক সহায়তা (Side-Help)'),
                    ),
                  ],
                ),
                if (_pollRevealed) ...[
                  const SizedBox(height: 10),
                  Container(
                    key: const Key('mobile-broadcast-reveal-banner'),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AcademicColors.emeraldSuccess.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'সকল সহপাঠীর উত্তর জমা সম্পন্ন! সঠিক উত্তর: B (12xy) • কোহর্ট সঠিকতা: ১০০%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AcademicColors.navyPrimary,
                      ),
                    ),
                  ),
                ],
                if (_showIndividualSideHelp) ...[
                  const SizedBox(height: 10),
                  Container(
                    key: const Key('mobile-individual-side-help-box'),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AcademicColors.tealAccent.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const MathBanglaRichText(
                      content:
                          r'একক সহায়তা (যৌথ বোর্ড অপরিবর্তিত রেখে): প্রথম পদ $a = 2x$ ও দ্বিতীয় পদ $b = 3y$ গুণ করে ২ দিয়ে গুণ করলে $12xy$ পাওয়া যায়।',
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // FIFO Raise-Hand Queue Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Text(
                      'হাত তোলার কিউ (FIFO Raise-Hand Queue)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AcademicColors.navyPrimary,
                      ),
                    ),
                    ElevatedButton(
                      key: const Key('mobile-resolve-fifo-btn'),
                      onPressed: _resolveNextFifoHand,
                      child: const Text('পরবর্তী প্রশ্নের উত্তর দিন'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ..._raiseHandQueue.asMap().entries.map((entry) {
                  final idx = entry.key + 1;
                  final item = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      key: Key('mobile-fifo-item-$idx'),
                      tileColor: Colors.grey.shade100,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      title: Text(
                        '#${toBanglaNumerals(idx)} ${item['pseudonym']}: ${item['question']}',
                        style: const TextStyle(fontSize: 13),
                      ),
                      trailing: Text(
                        item['status'] ?? 'queued',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
