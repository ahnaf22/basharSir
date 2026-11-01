import 'package:flutter/material.dart';
import '../core/storage/offline_cache_store.dart';
import '../core/theme/academic_theme.dart';
import '../features/ai_tutor/presentation/mobile_ai_tutor_workspace.dart';
import '../features/authentication/presentation/mobile_auth_and_onboarding_screen.dart';
import '../features/examination/presentation/mobile_timed_exam_and_parent_screen.dart';
import '../features/group_learning/presentation/mobile_group_learning_screen.dart';
import '../features/materials/presentation/offline_materials_reader_screen.dart';
import '../features/study_planner/presentation/mobile_study_planner_screen.dart';

class HomeTutorMobileApp extends StatefulWidget {
  final OfflineCacheStore? cacheStore;

  const HomeTutorMobileApp({super.key, this.cacheStore});

  @override
  State<HomeTutorMobileApp> createState() => _HomeTutorMobileAppState();
}

class _HomeTutorMobileAppState extends State<HomeTutorMobileApp> {
  late final OfflineCacheStore _cacheStore;
  int _selectedIndex = 0;
  bool _showGroupStudy = false;

  @override
  void initState() {
    super.initState();
    _cacheStore = widget.cacheStore ?? OfflineCacheStore();
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      MobileAiTutorWorkspace(cacheStore: _cacheStore),
      OfflineMaterialsReaderScreen(cacheStore: _cacheStore),
      const MobileStudyPlannerScreen(),
      MobileTimedExamAndParentScreen(cacheStore: _cacheStore),
      const MobileAuthAndOnboardingScreen(),
    ];

    return MaterialApp(
      title: 'AI Home Tutor Bangladesh',
      debugShowCheckedModeBanner: false,
      theme: buildAcademicTheme(),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('এআই হোম টিউটর বাংলাদেশ (NCTB)'),
          actions: [
            TextButton.icon(
              key: const Key('nav-group-study'),
              onPressed: () => setState(() => _showGroupStudy = !_showGroupStudy),
              icon: const Icon(Icons.groups_outlined, color: Colors.white),
              label: const Text(
                'গ্রুপ স্টাডি',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        body: _showGroupStudy
            ? const MobileGroupLearningScreen()
            : screens[_selectedIndex],
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (idx) => setState(() {
            _showGroupStudy = false;
            _selectedIndex = idx;
          }),
          destinations: const [
            NavigationDestination(
              key: Key('nav-tutor'),
              icon: Icon(Icons.school_outlined),
              label: 'এআই টিউটর',
            ),
            NavigationDestination(
              key: Key('nav-materials'),
              icon: Icon(Icons.menu_book_outlined),
              label: 'পাঠ্যবই নোট',
            ),
            NavigationDestination(
              key: Key('nav-planner'),
              icon: Icon(Icons.calendar_month_outlined),
              label: 'স্টাডি প্ল্যান',
            ),
            NavigationDestination(
              key: Key('nav-exams'),
              icon: Icon(Icons.assignment_outlined),
              label: 'পরীক্ষা ও অভিভাবক',
            ),
            NavigationDestination(
              key: Key('nav-auth'),
              icon: Icon(Icons.verified_user_outlined),
              label: 'প্রোফাইল ও ওটিপি',
            ),
          ],
        ),
      ),
    );
  }
}
