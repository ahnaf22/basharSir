import 'package:flutter/material.dart';

class AcademicColors {
  static const Color navyPrimary = Color(0xFF0F2942);
  static const Color tealAccent = Color(0xFF0D9488);
  static const Color warmSurface = Color(0xFFF8FAFC);
  static const Color amberWarning = Color(0xFFD97706);
  static const Color emeraldSuccess = Color(0xFF059669);
}

String toBanglaNumerals(Object input) {
  const englishToBangla = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  final raw = input.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < raw.length; i++) {
    final ch = raw[i];
    buffer.write(englishToBangla[ch] ?? ch);
  }
  return buffer.toString();
}

ThemeData buildAcademicTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AcademicColors.navyPrimary,
      primary: AcademicColors.navyPrimary,
      secondary: AcademicColors.tealAccent,
      surface: AcademicColors.warmSurface,
    ),
    scaffoldBackgroundColor: AcademicColors.warmSurface,
    appBarTheme: const AppBarTheme(
      backgroundColor: AcademicColors.navyPrimary,
      foregroundColor: Colors.white,
      elevation: 0,
    ),
  );
}

