<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Output\ConsoleOutput;

Artisan::command('inspire', function (): void {
    (new ConsoleOutput)->writeln(Inspiring::quote());
})->purpose('Display an inspiring quote');
