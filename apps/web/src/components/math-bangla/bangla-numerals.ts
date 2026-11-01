const BANGLA_DIGITS: readonly string[] = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

const ENGLISH_DIGITS_MAP: Readonly<Record<string, string>> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Deterministically converts Western Arabic digits (0-9) to Bengali numerals (০-৯)
 * for textbook citations, question numbers, percentages, and dates.
 */
export function toBanglaNumerals(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => {
    const index = Number(digit);
    return BANGLA_DIGITS[index] ?? digit;
  });
}

/**
 * Normalizes Bengali numerals (০-৯) back to ASCII digits (0-9) for algebraic input or phone validation.
 */
export function toAsciiNumerals(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => ENGLISH_DIGITS_MAP[digit] ?? digit);
}

