import { z } from 'zod';
import { toAsciiNumerals } from '@/components/math-bangla/bangla-numerals';

export function normalizeBangladeshPhoneInput(raw: string): string {
  const ascii = toAsciiNumerals(raw.trim()).replace(/[\s\-()]+/g, '');
  if (ascii.startsWith('01') && ascii.length === 11) {
    return `+88${ascii}`;
  }
  if (ascii.startsWith('8801') && ascii.length === 13) {
    return `+${ascii}`;
  }
  return ascii;
}

export const bangladeshPhoneSchema = z
  .string()
  .min(11, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (১১ সংখ্যা)')
  .transform(normalizeBangladeshPhoneInput)
  .refine(
    (val) => /^\+8801[3-9][0-9]{8}$/.test(val),
    'সঠিক বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)'
  );

export const loginCredentialSchema = z
  .string()
  .min(1, 'মোবাইল নম্বর অথবা ইমেইল লিখুন')
  .transform((val) => {
    const raw = val.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return raw.toLowerCase();
    }
    return normalizeBangladeshPhoneInput(raw);
  })
  .refine(
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
      /^\+8801[3-9][0-9]{8}$/.test(val),
    'সঠিক বাংলাদেশি মোবাইল নম্বর (যেমন: 017XXXXXXXX) অথবা ইমেইল প্রদান করুন'
  );

export const loginFormSchema = z.object({
  phone: loginCredentialSchema,
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const studentRegistrationSchema = z.object({
  name_bn: z.string().min(2, 'বাংলায় পূর্ণ নাম লিখুন').max(150),
  name_en: z.string().min(2, 'ইংরেজিতে পূর্ণ নাম লিখুন').max(150),
  phone: bangladeshPhoneSchema,
  guardian_phone: bangladeshPhoneSchema,
  current_class_level: z.coerce.number().int().min(6).max(10),
  medium: z.enum(['bangla', 'english_version']),
  school_name: z.string().max(200).optional(),
  district: z.string().max(80).optional(),
  password: z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
});

export type StudentRegistrationValues = z.infer<typeof studentRegistrationSchema>;

export const guardianRegistrationSchema = z.object({
  name_bn: z.string().min(2, 'বাংলায় পূর্ণ নাম লিখুন').max(150),
  name_en: z.string().min(2, 'ইংরেজিতে পূর্ণ নাম লিখুন').max(150),
  phone: bangladeshPhoneSchema,
  relation_type: z.enum(['father', 'mother', 'legal_guardian']),
  weekly_report_channel: z.enum(['sms', 'whatsapp', 'email', 'push']),
  password: z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
});

export type GuardianRegistrationValues = z.infer<typeof guardianRegistrationSchema>;

export const otpVerifySchema = z.object({
  code: z
    .string()
    .transform((val) => toAsciiNumerals(val.trim()))
    .refine((val) => /^[0-9]{6}$/.test(val), '৬ সংখ্যার ওটিপি (OTP) কোড লিখুন'),
});

export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;

