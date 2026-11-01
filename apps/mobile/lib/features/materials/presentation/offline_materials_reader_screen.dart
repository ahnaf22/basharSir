import 'package:flutter/material.dart';
import '../../../core/storage/offline_cache_store.dart';
import '../../../core/theme/academic_theme.dart';
import '../../../shared/widgets/math_bangla_rich_text.dart';

class OfflineMaterialsReaderScreen extends StatefulWidget {
  final OfflineCacheStore cacheStore;

  const OfflineMaterialsReaderScreen({
    super.key,
    required this.cacheStore,
  });

  @override
  State<OfflineMaterialsReaderScreen> createState() =>
      _OfflineMaterialsReaderScreenState();
}

class _OfflineMaterialsReaderScreenState
    extends State<OfflineMaterialsReaderScreen> {
  bool _simulateOffline = false;
  int _selectedChapterId = 401;

  static final List<CachedChapterMaterial> _nctbCatalog = [
    CachedChapterMaterial(
      chapterId: 401,
      subjectNameBn: 'গণিত (অষ্টম শ্রেণি)',
      chapterTitleBn: 'চতুর্থ অধ্যায়: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
      summaryNotesBn:
          r'দুইটি রাশির যোগফলের বর্গ নির্ণয়ের সূত্র হলো $(a + b)^2 = a^2 + 2ab + b^2$ এবং বিয়োগফলের বর্গ $(a - b)^2 = a^2 - 2ab + b^2$।',
      keyFormulas: [
        r'$(a + b)^2 = a^2 + 2ab + b^2$',
        r'$a^2 - b^2 = (a + b)(a - b)$',
      ],
      downloadedAt: DateTime(2026, 11, 1),
    ),
    CachedChapterMaterial(
      chapterId: 501,
      subjectNameBn: 'বিজ্ঞান (অষ্টম শ্রেণি)',
      chapterTitleBn: 'ষষ্ঠ অধ্যায়: পরমাণুর গঠন',
      summaryNotesBn:
          r'পরমাণুর কেন্দ্রে নিউক্লিয়াসে প্রোটন ও নিউট্রন থাকে এবং বাইরে কক্ষপথে ইলেকট্রন ঘোরে। প্রথম কক্ষপথে সর্বোচ্চ $2n^2 = 2$ টি ইলেকট্রন থাকে।',
      keyFormulas: [
        r'কক্ষপথের সর্বোচ্চ ইলেকট্রন সংখ্যা $= 2n^2$',
      ],
      downloadedAt: DateTime(2026, 11, 1),
    ),
  ];

  void _downloadForOffline(CachedChapterMaterial chapter) {
    setState(() {
      widget.cacheStore.cacheChapterMaterial(chapter);
    });
  }

  @override
  Widget build(BuildContext context) {
    final activeChapter = _nctbCatalog.firstWhere(
      (c) => c.chapterId == _selectedChapterId,
      orElse: () => _nctbCatalog.first,
    );
    final cached = widget.cacheStore.getCachedChapter(activeChapter.chapterId);

    return Column(
      children: [
        OfflineStatusBanner(isOffline: _simulateOffline),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 8,
                children: [
                  const Text(
                    'এনসিটিবি পাঠ্যবই ও অফলাইন নোট',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AcademicColors.navyPrimary,
                    ),
                  ),
                  FilterChip(
                    key: const Key('toggle-offline-reader-chip'),
                    label: Text(_simulateOffline ? 'অফলাইন' : 'অনলাইন'),
                    selected: _simulateOffline,
                    onSelected: (v) => setState(() => _simulateOffline = v),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: _nctbCatalog.map((ch) {
                  return ChoiceChip(
                    key: Key('chapter-chip-${ch.chapterId}'),
                    label: Text(ch.chapterTitleBn),
                    selected: _selectedChapterId == ch.chapterId,
                    onSelected: (_) =>
                        setState(() => _selectedChapterId = ch.chapterId),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              activeChapter.chapterTitleBn,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AcademicColors.navyPrimary,
                              ),
                            ),
                          ),
                          ElevatedButton.icon(
                            key: const Key('download-offline-note-btn'),
                            onPressed: () => _downloadForOffline(activeChapter),
                            icon: Icon(
                              cached != null
                                  ? Icons.offline_pin
                                  : Icons.download_for_offline_outlined,
                              size: 18,
                            ),
                            label: Text(
                              cached != null
                                  ? 'অফলাইনে সংরক্ষিত'
                                  : 'অফলাইনে ডাউনলোড',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      MathBanglaRichText(
                        content:
                            (cached ?? activeChapter).summaryNotesBn,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'প্রয়োজনীয় সূত্রসমূহ (Key Formulas):',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 6),
                      ...activeChapter.keyFormulas.map(
                        (f) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: MathBanglaRichText(content: f),
                        ),
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
