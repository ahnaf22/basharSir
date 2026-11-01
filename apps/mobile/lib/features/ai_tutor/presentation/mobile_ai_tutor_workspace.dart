import 'package:flutter/material.dart';
import '../../../core/storage/offline_cache_store.dart';
import '../../../core/theme/academic_theme.dart';
import '../../../shared/widgets/math_bangla_rich_text.dart';

class MobileAiTutorWorkspace extends StatefulWidget {
  final OfflineCacheStore cacheStore;

  const MobileAiTutorWorkspace({
    super.key,
    required this.cacheStore,
  });

  @override
  State<MobileAiTutorWorkspace> createState() => _MobileAiTutorWorkspaceState();
}

class _MobileAiTutorWorkspaceState extends State<MobileAiTutorWorkspace> {
  String _currentStage = 'EXPLAIN_CONCEPT';
  int _hintsRevealed = 0;
  int _masteryPct = 42;
  String _tutorExplanationBn =
      r'আজ আমরা বীজগণিতের বর্গের সূত্র $(a + b)^2 = a^2 + 2ab + b^2$ ধাপে ধাপে শিখব।';
  final TextEditingController _answerController = TextEditingController();

  static const List<String> _hintsBn = [
    r'ইঙ্গিত ১: প্রথমে সদৃশ পদগুলো $(3x + 2x)$ একসাথে লেখো।',
    r'ইঙ্গিত ২: সহগ $3$ এবং $2$ যোগ করো, চলক $x$-এর ঘাত অপরিবর্তিত থাকবে।',
    r'ইঙ্গিত ৩: $3 + 2 = 5$, তাই উত্তর হবে $5x$।',
  ];

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  void _triggerPedagogicalAction(String actionType, String responseBn) {
    final clientTurnId = 'mobile-turn-$actionType';
    widget.cacheStore.recordTutorTurnSubmission(clientTurnId, {
      'client_turn_id': clientTurnId,
      'action_type': actionType,
    });
    setState(() {
      _tutorExplanationBn = responseBn;
      if (actionType == 'hint' && _hintsRevealed < 3) {
        _hintsRevealed++;
      }
    });
  }

  void _submitPracticeAnswer() {
    final ans = _answerController.text.trim();
    widget.cacheStore.recordTutorTurnSubmission('mobile-turn-answer-1', {
      'client_turn_id': 'mobile-turn-answer-1',
      'action_type': 'answer',
      'student_input_text': ans,
    });
    setState(() {
      if (ans == '5x') {
        _currentStage = 'MINI_ASSESSMENT';
        _masteryPct = 76;
        _tutorExplanationBn =
            r'শাবাশ! সঠিক উত্তর $5x$। এবার সংক্ষিপ্ত মূল্যায়ন ধাপে যাওয়া যাক।';
      } else {
        _currentStage = 'IDENTIFY_MISCONCEPTION';
        _tutorExplanationBn =
            r'তুমি এখানে $x$-এর ঘাত বাড়িয়ে দিয়েছ। কিন্তু $3x$ এবং $2x$ সদৃশ পদ, তাই শুধু সহগ যোগ হয়ে $5x$ হবে।';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'ধাপ: $_currentStage',
                  key: const Key('mobile-tutor-stage-badge'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AcademicColors.navyPrimary,
                  ),
                ),
                Text(
                  'দক্ষতা: ${toBanglaNumerals(_masteryPct)}%',
                  key: const Key('mobile-tutor-mastery-badge'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AcademicColors.tealAccent,
                  ),
                ),
              ],
            ),
          ),
          const TabBar(
            labelColor: AcademicColors.navyPrimary,
            indicatorColor: AcademicColors.tealAccent,
            tabs: [
              Tab(
                key: Key('tutor-tab-lesson'),
                text: 'পাঠ বোর্ড',
              ),
              Tab(
                key: Key('tutor-tab-practice'),
                text: 'অনুশীলন ও ইঙ্গিত',
              ),
              Tab(
                key: Key('tutor-tab-help'),
                text: 'টিউটর সহায়তা',
              ),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                // Mode 1: Lesson Board
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      elevation: 0,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'এআই প্রাইভেট টিউটর বোর্ড (NCTB Class 8 Math)',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AcademicColors.navyPrimary,
                              ),
                            ),
                            const SizedBox(height: 10),
                            MathBanglaRichText(
                              key: const Key('mobile-tutor-explanation'),
                              content: _tutorExplanationBn,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                // Mode 2: Practice & Progressive Hints
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      elevation: 0,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const MathBanglaRichText(
                              content: r'প্রশ্ন: $3x + 2x = ?$',
                            ),
                            const SizedBox(height: 10),
                            TextField(
                              key: const Key('mobile-tutor-answer-input'),
                              controller: _answerController,
                              decoration: const InputDecoration(
                                labelText: 'তোমার উত্তর লেখো (যেমন: 5x)',
                                border: OutlineInputBorder(),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                ElevatedButton(
                                  key: const Key('mobile-tutor-submit-btn'),
                                  onPressed: _submitPracticeAnswer,
                                  child: const Text('উত্তর যাচাই করো'),
                                ),
                                const SizedBox(width: 10),
                                OutlinedButton(
                                  key: const Key('mobile-tutor-hint-btn'),
                                  onPressed: () => _triggerPedagogicalAction(
                                    'hint',
                                    _tutorExplanationBn,
                                  ),
                                  child: Text(
                                    'ইঙ্গিত দাও (${toBanglaNumerals(_hintsRevealed)}/৩)',
                                  ),
                                ),
                              ],
                            ),
                            if (_hintsRevealed > 0) ...[
                              const SizedBox(height: 12),
                              ..._hintsBn.take(_hintsRevealed).map(
                                    (h) => Padding(
                                      padding: const EdgeInsets.only(bottom: 6),
                                      child: MathBanglaRichText(content: h),
                                    ),
                                  ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                // Mode 3: 1-Click Bangla Pedagogical Controls
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    ElevatedButton(
                      key: const Key('mobile-btn-simplify'),
                      onPressed: () => _triggerPedagogicalAction(
                        'simplify',
                        r'সহজ ব্যাখ্যা: মনে করো ৩টি কলম ও ২টি কলম যোগ করলে ৫টি কলম হয়, অর্থাৎ $3x + 2x = 5x$।',
                      ),
                      child: const Text('আরেকটু সহজ করে বোঝাও'),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      key: const Key('mobile-btn-example'),
                      onPressed: () => _triggerPedagogicalAction(
                        'example',
                        r'নতুন উদাহরণ: $(x + 3)^2 = x^2 + 6x + 9$।',
                      ),
                      child: const Text('আরেকটি উদাহরণ দাও'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
