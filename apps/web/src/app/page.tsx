import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import { MathBanglaText } from '@/components/math-bangla/MathBanglaText';
import { toBanglaNumerals } from '@/components/math-bangla/bangla-numerals';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const PEDAGOGICAL_STAGES = [
  { step: 1, title: 'পাঠ পরিচিতি ও শিখনফল', status: 'completed' as const },
  { step: 2, title: 'পূর্বজ্ঞান যাচাই', status: 'completed' as const },
  { step: 3, title: 'মূল ধারণা ও সূত্র ব্যাখ্যা', status: 'completed' as const },
  { step: 4, title: 'হাতে-কলমে অনুশীলন', status: 'active' as const },
  { step: 5, title: 'দক্ষতা বৃদ্ধি ও গাণিতিক প্রয়োগ', status: 'upcoming' as const },
  { step: 6, title: 'সংক্ষিপ্ত মূল্যায়ন (Mini Quiz)', status: 'upcoming' as const },
  { step: 7, title: 'পাঠ সমাপ্তি ও অগ্রগতি সংরক্ষণ', status: 'upcoming' as const },
];

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Academic Top Navigation Bar */}
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-brand-primary">
                বাশার স্যার · AI গৃহশিক্ষক
              </span>
              <p className="text-xs text-content-secondary">
                জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB ২০২৬) অনুমোদিত কাঠামো
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="navy">NCTB-2026-BM-v1.0</Badge>
            <Badge variant="teal">শ্রেণি ৬–৮ (বাংলা মাধ্যম)</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero & Curriculum Identity Banner */}
        <section className="mb-8 rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="teal">পাঠ্যক্রম-প্রথম স্থাপত্য (Curriculum-First)</Badge>
                <Badge variant="success">PDPA ২০২৬ শিশু সুরক্ষা সম্মত</Badge>
              </div>
              <h1 className="font-heading text-2xl font-bold leading-bangla-heading text-brand-primary sm:text-3xl">
                প্রত্যেক শিক্ষার্থীর জন্য ধাপে ধাপে শেখানোর ব্যক্তিগত ডিজিটাল গৃহশিক্ষক
              </h1>
              <MathBanglaText
                content="সাধারণ চ্যাটবট নয় — এই গৃহশিক্ষক প্রথমে শিক্ষার্থীর পূর্বজ্ঞান যাচাই করে, পাঠ্যবইয়ের আলোকে সূত্র যেমন $(a + b)^2 = a^2 + 2ab + b^2$ সহজভাবে ব্যাখ্যা করে এবং ভুল ধারণা চিহ্নিত করে অনুশীলনের মাধ্যমে দক্ষতা নিশ্চিত করে।"
                variant="lesson-body"
                className="text-content-secondary"
              />
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full">
                  শিক্ষার্থী / অভিভাবক নিবন্ধন করুন
                </Button>
              </Link>
              <Link href="/parent/children">
                <Button variant="outline" size="md" className="w-full">
                  অভিভাবক ড্যাশবোর্ড ও PDPA সম্মতি
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Signature 3-Pane Academic Learning Workspace Preview */}
        <section aria-label="AI Private Tutor 3-Pane Academic Workspace">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-content-secondary">
              <Compass className="h-4 w-4 text-brand-secondary" />
              <span>অষ্টম শ্রেণি · গণিত</span>
              <span>/</span>
              <span className="font-semibold text-content-primary">
                অধ্যায় {toBanglaNumerals(4)}: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ
              </span>
            </div>
            <Badge variant="teal">
              ধাপ {toBanglaNumerals(4)}/{toBanglaNumerals(7)} · হাতে-কলমে অনুশীলন
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* LEFT PANE: Curriculum & 7-Step Progression Rail */}
            <Card className="lg:col-span-3" elevated>
              <h2 className="mb-3 font-heading text-base font-semibold text-brand-primary">
                পাঠের অগ্রগতি ধাপসমূহ
              </h2>
              <ol className="space-y-2.5">
                {PEDAGOGICAL_STAGES.map((item) => (
                  <li
                    key={item.step}
                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                      item.status === 'active'
                        ? 'border-brand-secondary bg-brand-secondary/10 font-semibold text-brand-primary'
                        : item.status === 'completed'
                          ? 'border-border-subtle bg-subtle/60 text-content-secondary'
                          : 'border-transparent text-content-secondary'
                    }`}
                  >
                    <span className="mt-0.5 font-heading text-xs font-bold">
                      {toBanglaNumerals(item.step)}.
                    </span>
                    <span className="flex-1">{item.title}</span>
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
                    )}
                  </li>
                ))}
              </ol>

              <div className="mt-5 border-t border-border-subtle pt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                  <span className="text-content-secondary">অধ্যায় দক্ষতা (Mastery)</span>
                  <span className="font-semibold text-brand-secondary">
                    {toBanglaNumerals(68)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-subtle">
                  <div
                    className="h-full rounded-full bg-brand-secondary"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>
            </Card>

            {/* CENTER PANE: NCTB Concept Board & Active Interactive Question */}
            <div className="space-y-5 lg:col-span-6">
              <Card elevated>
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="navy">পাঠ্যবইয়ের মূল সূত্র ও উদাহরণ</Badge>
                  <span className="text-xs text-content-secondary">
                    NCTB অষ্টম শ্রেণি গণিত · পৃষ্ঠা {toBanglaNumerals(49)}
                  </span>
                </div>
                <h2 className="mb-2 font-heading text-lg font-semibold text-brand-primary">
                  সূত্র {toBanglaNumerals(1)}: দ্বিপদী রাশির বর্গের বিস্তার
                </h2>
                <MathBanglaText
                  content="দুইটি রাশির যোগফলের বর্গ সমান প্রথম রাশির বর্গ যোগ দুই গুণ প্রথম রাশি গুণ দ্বিতীয় রাশি যোগ দ্বিতীয় রাশির বর্গ: $$(a + b)^2 = a^2 + 2ab + b^2$$ উদাহরণস্বরূপ, যদি $a = 3x$ এবং $b = 4y$ হয়, তবে $(3x + 4y)^2 = (3x)^2 + 2(3x)(4y) + (4y)^2 = 9x^2 + 24xy + 16y^2$।"
                  variant="lesson-body"
                />
              </Card>

              <Card className="border-brand-secondary/40" elevated>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="amber">একক অনুশীলন প্রশ্ন #{toBanglaNumerals(2)}</Badge>
                  <span className="text-xs text-content-secondary">
                    ইঙ্গিত ব্যবহৃত: {toBanglaNumerals(1)}/{toBanglaNumerals(3)}
                  </span>
                </div>
                <MathBanglaText
                  content="প্রশ্ন: সূত্রের সাহায্যে $(2x + 5y)^2$ এর বিস্তৃতি নির্ণয় করো এবং মধ্যপদটি লেখো।"
                  variant="question"
                  className="mb-4"
                />
                <div className="rounded-lg border border-border-subtle bg-subtle p-3 text-sm text-content-secondary">
                  <MathBanglaText
                    content="ইঙ্গিত ১: এখানে প্রথম পদ $a = 2x$ এবং দ্বিতীয় পদ $b = 5y$ ধরে $2ab$ পদটি হিসাব করো।"
                    variant="compact"
                  />
                </div>
              </Card>
            </div>

            {/* RIGHT PANE: Contextual Tutor Guidance & Pedagogical Quick Actions */}
            <Card className="flex flex-col justify-between lg:col-span-3" elevated>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-secondary" />
                  <h2 className="font-heading text-base font-semibold text-brand-primary">
                    গৃহশিক্ষকের নির্দেশনা
                  </h2>
                </div>

                <div className="rounded-xl border border-border-subtle bg-subtle p-3.5">
                  <MathBanglaText
                    content="লক্ষ্য করো, $(2x)^2$ করার সময় সংখ্যা $2$-এর বর্গ $4$ এবং চলক $x$-এর বর্গ $x^2$ উভয়ই লিখতে হবে। শুধুমাত্র $2x^2$ লিখলে সহগের বর্গ বাদ পড়ে যাবে।"
                    variant="compact"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    সহায়ক বাটনসমূহ
                  </p>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    সহজ করে বোঝাও
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    আরেকটি উদাহরণ দাও
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    ইঙ্গিত দাও (Hint {toBanglaNumerals(2)}/{toBanglaNumerals(3)})
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-border-subtle pt-3 text-xs text-content-secondary">
                <ShieldCheck className="h-4 w-4 shrink-0 text-status-success" />
                <span>শুধুমাত্র যাচাইকৃত মূল্যায়ন তথ্যের ভিত্তিতে দক্ষতা স্কোর গণনা করা হয়।</span>
              </div>
            </Card>
          </div>
        </section>

        {/* All 12 Ecosystem Modules Quick Navigation Grid */}
        <section className="mt-10 rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-brand-primary">
                সম্পূর্ণ প্ল্যাটফর্ম মডিউল ডিরেক্টরি (শ্রেণি ১–১০ • NCTB ২০২৬)
              </h2>
              <p className="text-xs text-content-secondary">
                যেকোনো মডিউলে ক্লিক করে সরাসরি ওয়ার্কস্পেস ব্যবহার করুন
              </p>
            </div>
            <Badge variant="teal">১২টি সম্পূর্ণ মডিউল সক্রিয়</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/tutor"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০১. এআই প্রাইভেট টিউটর (৩-পেইন)
              </p>
              <p className="mt-1 text-xs text-content-secondary">/tutor</p>
            </Link>
            <Link
              href="/materials"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০২. পাঠ্যবই ও স্টাডি ম্যাটেরিয়ালস
              </p>
              <p className="mt-1 text-xs text-content-secondary">/materials</p>
            </Link>
            <Link
              href="/planner"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৩. স্টাডি প্ল্যানার ও ক্যালেন্ডার
              </p>
              <p className="mt-1 text-xs text-content-secondary">/planner</p>
            </Link>
            <Link
              href="/exams"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৪. টাইমড পরীক্ষা ও রুব্রিক মূল্যায়ন
              </p>
              <p className="mt-1 text-xs text-content-secondary">/exams</p>
            </Link>
            <Link
              href="/group-learning"
              className="rounded-xl border border-brand-secondary bg-brand-secondary/10 p-3.5 transition hover:border-brand-primary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৫. স্মল-গ্রুপ স্টাডি রুম (৩–৫ জন)
              </p>
              <p className="mt-1 text-xs text-content-secondary">/group-learning</p>
            </Link>
            <Link
              href="/scripts"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৬. হাতের লেখা ওসিআর ও গেমিফিকেশন
              </p>
              <p className="mt-1 text-xs text-content-secondary">/scripts</p>
            </Link>
            <Link
              href="/analytics"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৭. শিক্ষার্থী পারফরম্যান্স ড্যাশবোর্ড
              </p>
              <p className="mt-1 text-xs text-content-secondary">/analytics</p>
            </Link>
            <Link
              href="/teachers"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৮. শিক্ষক মার্কেটপ্লেস ও শ্রেণি ১–১০
              </p>
              <p className="mt-1 text-xs text-content-secondary">/teachers</p>
            </Link>
            <Link
              href="/parent/dashboard"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ০৯. অভিভাবক পোর্টাল ও সাপ্তাহিক রিপোর্ট
              </p>
              <p className="mt-1 text-xs text-content-secondary">/parent/dashboard</p>
            </Link>
            <Link
              href="/parent/billing"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ১০. সাবস্ক্রিপশন ও bKash/Nagad বিলিং
              </p>
              <p className="mt-1 text-xs text-content-secondary">/parent/billing</p>
            </Link>
            <Link
              href="/parent/children"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ১১. PDPA ২০২৬ অভিভাবক সম্মতি কেন্দ্র
              </p>
              <p className="mt-1 text-xs text-content-secondary">/parent/children</p>
            </Link>
            <Link
              href="/admin/curriculum"
              className="rounded-xl border border-border-subtle bg-subtle/50 p-3.5 transition hover:border-brand-secondary"
            >
              <p className="font-heading text-sm font-bold text-brand-primary">
                ১২. অ্যাডমিন কারিকুলাম ও CMS
              </p>
              <p className="mt-1 text-xs text-content-secondary">/admin/curriculum</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

