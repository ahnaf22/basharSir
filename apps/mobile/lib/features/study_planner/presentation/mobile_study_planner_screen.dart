import 'package:flutter/material.dart';
import '../../../core/theme/academic_theme.dart';

class MobileStudyPlannerScreen extends StatefulWidget {
  const MobileStudyPlannerScreen({super.key});

  @override
  State<MobileStudyPlannerScreen> createState() =>
      _MobileStudyPlannerScreenState();
}

class _MobileStudyPlannerScreenState extends State<MobileStudyPlannerScreen> {
  int _activeHeartbeatSeconds = 900; // 15 mins initial
  bool _rebalanced = false;
  final Map<int, bool> _completedTasks = {
    1: true,
    2: false,
    3: false,
  };

  void _sendHeartbeatPing() {
    setState(() {
      _activeHeartbeatSeconds += 30;
    });
  }

  @override
  Widget build(BuildContext context) {
    final activeMinutes = _activeHeartbeatSeconds ~/ 60;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          color: AcademicColors.navyPrimary,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 8,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'আজকের সক্রিয় পড়াশোনার সময় (Active Heartbeat)',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${toBanglaNumerals(activeMinutes)} মিনিট (${toBanglaNumerals(_activeHeartbeatSeconds)} সেকেন্ড)',
                      key: const Key('mobile-heartbeat-counter'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                ElevatedButton(
                  key: const Key('trigger-heartbeat-ping-btn'),
                  onPressed: _sendHeartbeatPing,
                  child: const Text('+৩০ সে. পিং'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 12,
          runSpacing: 8,
          children: [
            const Text(
              'দৈনিক স্টাডি প্ল্যান ও চেকলিস্ট',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AcademicColors.navyPrimary,
              ),
            ),
            TextButton(
              key: const Key('mobile-rebalance-plan-btn'),
              onPressed: () => setState(() => _rebalanced = true),
              child: const Text('অ্যাডাপ্টিভ রিব্যালেন্স'),
            ),
          ],
        ),
        if (_rebalanced)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Text(
              'বাদ পড়া পাঠগুলো পরবর্তী ৭ দিনে স্বয়ংক্রিয়ভাবে পুনর্বিন্যাস করা হয়েছে।',
              key: Key('mobile-rebalanced-banner'),
              style: TextStyle(
                color: AcademicColors.tealAccent,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
        CheckboxListTile(
          key: const Key('planner-task-1'),
          value: _completedTasks[1] ?? false,
          onChanged: (v) => setState(() => _completedTasks[1] = v ?? false),
          title: const Text('পূর্বজ্ঞান যাচাই: বীজগণিতীয় রাশি ও চলক (৩০ মিনিট)'),
          subtitle: const Text('অষ্টম শ্রেণি • গণিত'),
        ),
        CheckboxListTile(
          key: const Key('planner-task-2'),
          value: _completedTasks[2] ?? false,
          onChanged: (v) => setState(() => _completedTasks[2] = v ?? false),
          title: const Text(r'মূল পাঠ: বর্গের সূত্র $(a+b)^2$ ও প্রয়োগ (৪৫ মিনিট)'),
          subtitle: const Text('অষ্টম শ্রেণি • গণিত'),
        ),
        CheckboxListTile(
          key: const Key('planner-task-3'),
          value: _completedTasks[3] ?? false,
          onChanged: (v) => setState(() => _completedTasks[3] = v ?? false),
          title: const Text('অধ্যায়ভিত্তিক সংক্ষিপ্ত কুইজ: পরমাণুর গঠন (২০ মিনিট)'),
          subtitle: const Text('অষ্টম শ্রেণি • বিজ্ঞান'),
        ),
      ],
    );
  }
}
