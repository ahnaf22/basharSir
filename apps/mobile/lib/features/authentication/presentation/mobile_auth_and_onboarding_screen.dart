import 'package:flutter/material.dart';
import '../../../core/theme/academic_theme.dart';

class MobileAuthAndOnboardingScreen extends StatefulWidget {
  const MobileAuthAndOnboardingScreen({super.key});

  @override
  State<MobileAuthAndOnboardingScreen> createState() =>
      _MobileAuthAndOnboardingScreenState();
}

class _MobileAuthAndOnboardingScreenState
    extends State<MobileAuthAndOnboardingScreen> {
  final TextEditingController _phoneController =
      TextEditingController(text: '+8801711223344');
  final TextEditingController _otpController =
      TextEditingController(text: '123456');
  bool _otpSent = false;
  bool _otpVerified = false;
  bool _pdpaConsentApproved = false;
  String _selectedChildCode = 'STU-2026-0001';

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
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
                const Text(
                  'শিক্ষার্থী ও অভিভাবক লগইন (BD Mobile + OTP)',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AcademicColors.navyPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  key: const Key('mobile-phone-input'),
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'মোবাইল নম্বর (+8801...)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                if (!_otpSent)
                  ElevatedButton(
                    key: const Key('send-otp-btn'),
                    onPressed: () => setState(() => _otpSent = true),
                    child: const Text('ওটিপি (OTP) পাঠান'),
                  )
                else ...[
                  TextField(
                    key: const Key('otp-code-input'),
                    controller: _otpController,
                    maxLength: 6,
                    decoration: const InputDecoration(
                      labelText: '৬-সংখ্যার ওটিপি কোড',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  ElevatedButton(
                    key: const Key('verify-otp-btn'),
                    onPressed: () => setState(() => _otpVerified = true),
                    child: const Text('ওটিপি যাচাই করুন'),
                  ),
                ],
                if (_otpVerified)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'মোবাইল নম্বর যাচাই সম্পন্ন (${toBanglaNumerals(6)} সংখ্যার ওটিপি)',
                      key: const Key('otp-verified-badge'),
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
        const SizedBox(height: 16),
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
                const Text(
                  'বাংলাদেশ পিডিপিএ ২০২৬ (PDPA 2026) অভিভাবক সম্মতি ও চাইল্ড সুইচার',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AcademicColors.navyPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  key: const Key('mobile-child-switcher'),
                  initialValue: _selectedChildCode,
                  decoration: const InputDecoration(
                    labelText: 'সন্তান নির্বাচন করুন',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'STU-2026-0001',
                      child: Text('রাফি আহমেদ (অষ্টম শ্রেণি • বাংলা মাধ্যম)'),
                    ),
                    DropdownMenuItem(
                      value: 'STU-2026-0002',
                      child: Text('তাসনিম আহমেদ (ষষ্ঠ শ্রেণি • বাংলা মাধ্যম)'),
                    ),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedChildCode = val);
                    }
                  },
                ),
                const SizedBox(height: 10),
                SwitchListTile(
                  key: const Key('pdpa-consent-toggle'),
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'অভিভাবক হিসেবে সন্তানের এআই টিউটর ব্যবহারে সম্মতি প্রদান করছি',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  value: _pdpaConsentApproved,
                  onChanged: (v) => setState(() => _pdpaConsentApproved = v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
