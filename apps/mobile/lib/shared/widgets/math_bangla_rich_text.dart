import 'package:flutter/material.dart';
import '../../core/theme/academic_theme.dart';

class MathBanglaRichText extends StatelessWidget {
  final String content;
  final TextStyle? style;

  const MathBanglaRichText({
    super.key,
    required this.content,
    this.style,
  });

  @override
  Widget build(BuildContext context) {
    final regex = RegExp(r'\$([^$]+)\$');
    final spans = <InlineSpan>[];
    var lastIndex = 0;

    for (final match in regex.allMatches(content)) {
      if (match.start > lastIndex) {
        spans.add(
          TextSpan(
            text: content.substring(lastIndex, match.start),
          ),
        );
      }
      final formula = match.group(1) ?? '';
      spans.add(
        WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AcademicColors.tealAccent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              formula,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontWeight: FontWeight.w700,
                color: AcademicColors.navyPrimary,
                fontSize: 13,
              ),
            ),
          ),
        ),
      );
      lastIndex = match.end;
    }

    if (lastIndex < content.length) {
      spans.add(TextSpan(text: content.substring(lastIndex)));
    }

    return RichText(
      text: TextSpan(
        style: style ??
            const TextStyle(
              fontSize: 15,
              height: 1.55,
              color: Color(0xFF1E293B),
            ),
        children: spans,
      ),
    );
  }
}

class OfflineStatusBanner extends StatelessWidget {
  final bool isOffline;
  final int pendingSyncCount;

  const OfflineStatusBanner({
    super.key,
    required this.isOffline,
    this.pendingSyncCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOffline && pendingSyncCount == 0) {
      return const SizedBox.shrink();
    }
    return Container(
      key: const Key('offline-status-banner'),
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: isOffline ? AcademicColors.amberWarning : AcademicColors.tealAccent,
      child: Text(
        isOffline
            ? 'অফলাইন মোড সক্রিয় — ডাউনলোড করা নোট ও পরীক্ষার খসড়া সংরক্ষিত হচ্ছে (অপেক্ষমাণ সিঙ্ক: ${toBanglaNumerals(pendingSyncCount)})'
            : 'অনলাইন সংযোগ ফিরে এসেছে — ${toBanglaNumerals(pendingSyncCount)}টি উত্তর সিঙ্ক হচ্ছে...',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

