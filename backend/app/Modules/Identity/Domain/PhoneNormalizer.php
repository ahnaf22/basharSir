<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain;

use App\Core\Exceptions\DomainException;

final class PhoneNormalizer
{
    /**
     * Converts Bengali numerals (০-৯), strips spaces/dashes, and normalizes
     * Bangladeshi mobile numbers to canonical E.164 format (+8801XXXXXXXXX).
     */
    public static function normalize(string $rawPhone): string
    {
        $bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $asciiDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $cleaned = str_replace($bengaliDigits, $asciiDigits, trim($rawPhone));
        $cleaned = (string) preg_replace('/[\s\-\(\)]+/', '', $cleaned);

        if (str_starts_with($cleaned, '01') && strlen($cleaned) === 11) {
            $cleaned = '+88'.$cleaned;
        } elseif (str_starts_with($cleaned, '8801') && strlen($cleaned) === 13) {
            $cleaned = '+'.$cleaned;
        }

        if (! self::isValidBangladeshMobile($cleaned)) {
            throw new DomainException(
                errorCode: 'INVALID_BD_PHONE_NUMBER',
                message: 'সঠিক বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: +88017XXXXXXXX বা 017XXXXXXXX)।',
                httpStatus: 422,
            );
        }

        return $cleaned;
    }

    public static function isValidBangladeshMobile(string $normalizedPhone): bool
    {
        return preg_match('/^\+8801[3-9][0-9]{8}$/', $normalizedPhone) === 1;
    }

    public static function mask(string $normalizedPhone): string
    {
        if (strlen($normalizedPhone) < 14) {
            return $normalizedPhone;
        }

        return substr($normalizedPhone, 0, 6).'******'.substr($normalizedPhone, -2);
    }
}
