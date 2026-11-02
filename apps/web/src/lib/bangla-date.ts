import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';

const BANGLA_DAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

const GREGORIAN_BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BENGALI_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
];

/**
 * Returns greeting based on time of day:
 * শুভ সকাল / শুভ দুপুর / শুভ বিকেল / শুভ সন্ধ্যা
 */
export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'শুভ সকাল';
  if (hour >= 12 && hour < 15) return 'শুভ দুপুর';
  if (hour >= 15 && hour < 18) return 'শুভ বিকেল';
  return 'শুভ সন্ধ্যা';
}

/**
 * Returns Gregorian date in Bangla e.g. "সোমবার, ২ নভেম্বর"
 */
export function formatGregorianBanglaDate(date: Date = new Date()): string {
  const dayName = BANGLA_DAYS[date.getDay()];
  const dayNum = toBanglaNumerals(date.getDate());
  const monthName = GREGORIAN_BANGLA_MONTHS[date.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Checks if a Gregorian year is leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Converts a Gregorian Date to the official Bangladesh Bongabdo (Bengali Calendar)
 * Month lengths in Bangladesh revised standard:
 * Boishakh - Ashwin: 31 days (months 0..5)
 * Kartik - Magh: 30 days (months 6..9)
 * Falgun: 29 days (30 in leap year) (month 10)
 * Chaitra: 30 days (month 11)
 */
export function formatBongabdoDate(date: Date = new Date()): string {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-indexed
  const gDay = date.getDate();

  // Reference start: April 14 is 1 Boishakh
  const bNewYear = new Date(gYear, 3, 14); // April 14
  let bYear = gYear - 593;

  const falgunDays = isLeapYear(gYear) ? 30 : 29;
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunDays, 30];

  let diffDays = Math.floor((date.getTime() - bNewYear.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Date is between Jan 1 and Apr 13
    bYear = gYear - 594;
    const prevBNewYear = new Date(gYear - 1, 3, 14);
    diffDays = Math.floor((date.getTime() - prevBNewYear.getTime()) / (1000 * 60 * 60 * 24));
  }

  let mIndex = 0;
  while (mIndex < 12) {
    const mLen = monthLengths[mIndex] ?? 30;
    if (diffDays >= mLen) {
      diffDays -= mLen;
      mIndex++;
    } else {
      break;
    }
  }

  const bDay = diffDays + 1;
  const bMonthName = BENGALI_MONTHS[mIndex] || 'বৈশাখ';

  return `${toBanglaNumerals(bDay)} ${bMonthName} ${toBanglaNumerals(bYear)}`;
}
