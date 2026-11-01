<?php

declare(strict_types=1);

namespace App\Modules\Payments\Contracts;

use App\Modules\Payments\Domain\Models\Payment;

interface PaymentGatewayInterface
{
    public function gatewayName(): string;

    /**
     * @return array{
     *   gateway: string,
     *   checkout_url: string,
     *   merchant_invoice_no: string
     * }
     */
    public function initiateCheckout(Payment $payment): array;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function verifyWebhookSignature(array $payload, string $signatureHeader): bool;
}
