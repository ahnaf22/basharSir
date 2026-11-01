<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Payments\Contracts\PaymentGatewayInterface;
use App\Modules\Payments\Domain\Models\Payment;

final class BkashGateway implements PaymentGatewayInterface
{
    public function gatewayName(): string
    {
        return 'bkash';
    }

    public function initiateCheckout(Payment $payment): array
    {
        return [
            'gateway' => 'bkash',
            'checkout_url' => 'https://tokenized.pay.bka.sh/v1.2.0-beta/checkout?invoice='.$payment->merchant_invoice_no,
            'merchant_invoice_no' => $payment->merchant_invoice_no,
        ];
    }

    public function verifyWebhookSignature(array $payload, string $signatureHeader): bool
    {
        $secret = (string) config('services.bkash.webhook_secret', 'bd-payment-webhook-secret-2026');
        $merchantInvoice = (string) ($payload['merchant_invoice_no'] ?? '');
        $trxId = (string) ($payload['gateway_trx_id'] ?? '');
        $status = (string) ($payload['status'] ?? '');

        $expected = hash_hmac('sha256', "bkash:{$merchantInvoice}:{$trxId}:{$status}", $secret);

        return hash_equals($expected, $signatureHeader);
    }
}
