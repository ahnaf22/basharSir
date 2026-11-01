<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Payments\Contracts\PaymentGatewayInterface;
use App\Modules\Payments\Domain\Models\Payment;

final class SslCommerzGateway implements PaymentGatewayInterface
{
    public function gatewayName(): string
    {
        return 'sslcommerz';
    }

    public function initiateCheckout(Payment $payment): array
    {
        return [
            'gateway' => 'sslcommerz',
            'checkout_url' => 'https://securepay.sslcommerz.com/gwprocess/v4/api.php?tran_id='.$payment->merchant_invoice_no,
            'merchant_invoice_no' => $payment->merchant_invoice_no,
        ];
    }

    public function verifyWebhookSignature(array $payload, string $signatureHeader): bool
    {
        $secret = (string) config('services.sslcommerz.webhook_secret', 'bd-payment-webhook-secret-2026');
        $merchantInvoice = (string) ($payload['merchant_invoice_no'] ?? '');
        $trxId = (string) ($payload['gateway_trx_id'] ?? '');
        $status = (string) ($payload['status'] ?? '');

        $expected = hash_hmac('sha256', "sslcommerz:{$merchantInvoice}:{$trxId}:{$status}", $secret);

        return hash_equals($expected, $signatureHeader);
    }
}
