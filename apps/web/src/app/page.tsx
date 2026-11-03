'use client';

import React, { useEffect, useRef, useState } from 'react';
import '@/styles/landing.css';
import Link from 'next/link';
import { useFocusTrap } from '@/lib/useFocusTrap';

export default function HomePage(): React.JSX.Element {
  // --- State for Interactivity ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  // Modal menu: trap Tab, close on Esc, return focus to the "মেনু" button.
  useFocusTrap(sheetRef, sheetOpen, () => setSheetOpen(false));
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);
  const [selectedChip, setSelectedChip] = useState('কেন এমন হয়?');
  const [examCurrentQ, setExamCurrentQ] = useState(7);
  const [selectedOption, setSelectedOption] = useState('b');
  const [copiedCode, setCopiedCode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(28 * 60 + 45);

  // --- Tutor Interactive Simulation Ref ---
  const playTutorRef = useRef<() => void>(() => {});

  // --- Canvas Refs ---
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Bangla Numerals Helper ---
  const bn = (n: number | string): string =>
    String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)] ?? d);

  // --- Confetti Celebration Burst ---
  const fireConfetti = () => {
    const cv = confettiCanvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    const r = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = ['#FFB238', '#14201B', '#7FD6A0', '#FF6152'];
    const ps = Array.from({ length: 110 }, () => ({
      x: r.width * 0.22,
      y: r.height * 0.42,
      vx: Math.random() * 9 - 2,
      vy: -Math.random() * 10 - 3,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      a: Math.random() * 6,
      va: Math.random() * 0.3 - 0.15,
      c: cols[(Math.random() * 4) | 0] ?? '#FFB238',
    }));

    let f = 0;
    const draw = () => {
      cx.clearRect(0, 0, r.width, r.height);
      ps.forEach((p) => {
        p.vy += 0.28;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.a);
        cx.fillStyle = p.c;
        cx.globalAlpha = Math.max(0, 1 - f / 150);
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      });
      if (++f < 150) {
        requestAnimationFrame(draw);
      } else {
        cx.clearRect(0, 0, r.width, r.height);
      }
    };
    draw();
  };

  // --- Timer Tick ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 40 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Copy Invite Code ---
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText('ADDA-724');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // --- Interactive Tutor Simulation & Scroll Reveal Animations ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const msgs = document.getElementById('msgs');
    const tutorApp = document.getElementById('tutorApp');
    const steps = tutorApp ? Array.from(tutorApp.querySelectorAll('#steps .step')) : [];

    const script = [
      { r: 't', x: 'চলো দেখি, 2x + 5 = 15 হলে x-এর মান কত?', st: 0 },
      { r: 's', x: '10?' },
      { r: 't', x: 'একটু চিন্তা করো! প্রথমে দুই পাশ থেকে 5 বাদ দিলে কী থাকে?' },
      { r: 'h', x: 'হিন্ট: x-কে একা করতে হলে আগে +5 সরাতে হবে' },
      { r: 's', x: '2x = 10!', st: 1 },
      { r: 't', x: 'এই তো! মাথায় ঢুকছে! এবার দুই পাশকে 2 দিয়ে ভাগ করো।' },
      { r: 's', x: 'x = 5!', st: 2 },
      { r: 'w', x: 'একদম ঠিক! চ্যাপ্টার ক্লিয়ার, বস!', st: 3 },
    ];

    let run = 0;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const setStep = (n: number) => {
      steps.forEach((s, i) => {
        s.classList.toggle('done', i < n);
        s.classList.toggle('cur', i === n);
      });
    };

    const node = (m: { r: string; x: string }) => {
      if (m.r === 'h') {
        const d = document.createElement('div');
        d.className = 'hint msg anim';
        d.style.maxWidth = 'none';
        d.textContent = m.x;
        return d;
      }
      const d = document.createElement('div');
      d.className = 'msg anim ' + (m.r === 's' ? 's' : 't');
      d.innerHTML = `<span class="ava" aria-hidden="true">${m.r === 's' ? 'না' : 'প'}</span><div class="bub ${m.r === 'w' ? 'win' : m.r}"></div>`;
      const bub = d.querySelector('.bub');
      if (bub) bub.textContent = m.x;
      return d;
    };

    async function playTutor() {
      if (reduce || !msgs) return;
      const id = ++run;
      msgs.innerHTML = '';
      setStep(0);
      for (const m of script) {
        if (id !== run) return;
        if (m.r !== 's') {
          const t = document.createElement('div');
          t.className = 'msg t anim';
          t.innerHTML =
            '<span class="ava" aria-hidden="true">প</span><div class="bub t typing"><i></i><i></i><i></i></div>';
          if (m.r !== 'h') {
            msgs.append(t);
            msgs.scrollTop = msgs.scrollHeight;
            await wait(900);
            t.remove();
          }
        } else {
          await wait(700);
        }
        if (id !== run) return;
        msgs.append(node(m));
        msgs.scrollTop = msgs.scrollHeight;
        if (m.st !== undefined) setStep(m.st);
        await wait(m.r === 'h' ? 700 : 500);
      }
    }

    playTutorRef.current = playTutor;

    // --- Hooks for Reveal Animations ---
    const hooks: Record<string, () => void> = {
      tutor: playTutor,
      progress: () => {
        if (reduce) return;
        const gr = document.getElementById('goalRing');
        if (gr) {
          gr.style.strokeDashoffset = '364.4';
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              gr.style.strokeDashoffset = '105.7';
            })
          );
        }
      },
      done: () => {
        if (reduce) return;
        const dcRing = document.getElementById('dcRing');
        const dcPct = document.getElementById('dcPct');
        if (!dcRing || !dcPct) return;
        let p = 0;
        const t0 = performance.now();
        const step = (t: number) => {
          p = Math.min(1, (t - t0) / 1200);
          const e = 1 - Math.pow(1 - p, 3);
          dcRing.style.strokeDashoffset = String(364.4 * (1 - e));
          dcPct.textContent = bn(Math.round(e * 100)) + '%';
          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            fireConfetti();
          }
        };
        requestAnimationFrame(step);
      },
    };

    const celebrateBtn = document.getElementById('celebrate');
    if (celebrateBtn) {
      celebrateBtn.addEventListener('click', () => hooks.done?.());
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
          const hookName = (e.target as HTMLElement).dataset.hook;
          if (hookName && hooks[hookName]) {
            hooks[hookName]();
          }
        });
      },
      { threshold: 0.22 }
    );

    const watch = (el: Element | null, hook?: string) => {
      if (!el) return;
      if (hook) (el as HTMLElement).dataset.hook = hook;
      const below = el.getBoundingClientRect().top > window.innerHeight * 0.9;
      if (below && !reduce) el.classList.add('armed');
      io.observe(el);
    };

    watch(document.querySelector('.st-top'));
    watch(document.querySelector('.mistakes'));
    watch(document.querySelector('.progress'), 'progress');
    watch(document.getElementById('tutorApp'), 'tutor');
    watch(document.getElementById('doneCard'), 'done');

    return () => {
      run++;
      io.disconnect();
    };
  }, []);

  // --- Chalk Dust Animation in Final Section ---
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let parts: Array<{ x: number; y: number; r: number; s: number; o: number; w: number }> = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      parts = Array.from({ length: Math.round(w / 14) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        s: Math.random() * 0.25 + 0.05,
        o: Math.random() * 0.35 + 0.05,
        w: Math.random() * 6.28,
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.y -= p.s;
        p.w += 0.01;
        p.x += Math.sin(p.w) * 0.2;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = `rgba(237,232,218,${p.o})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const totalTime = 40 * 60;
  const timeMinutes = Math.floor(timerSeconds / 60);
  const timeSecs = timerSeconds % 60;
  const timerDashoffset = 88 * (1 - timerSeconds / totalTime);

  return (
    <div className="min-h-screen bg-slate text-chalk font-body antialiased">
      {/* Texture Background */}
      <div className="board-tex" aria-hidden="true" />

      {/* ===================== HEADER ===================== */}
      <header className="hdr">
        <div className="wrap hdr-in">
          <Link className="logo" href="#top" aria-label="পড়া হবে! হোম">
            <span className="logo-mark" aria-hidden="true">প</span>
            <span className="logo-word">পড়া হবে<em>!</em></span>
          </Link>

          <nav className="nav" aria-label="প্রধান মেনু">
            <a href="#top" aria-current="page">হোম</a>
            <a href="#how">কীভাবে কাজ করে</a>
            <a href="#features">ফিচারসমূহ</a>
            <a href="#about">আমাদের সম্পর্কে</a>
          </nav>

          <div className="hdr-act">
            <Link className="btn-ghost" href="/login">লগইন</Link>
            <Link className="btn btn-sm" href="/register">পড়া শুরু করো</Link>
            <button
              className="menu-btn"
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-controls="sheet"
            >
              মেনু
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                <path d="M1 1h16M1 6h16M1 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE SHEET ===================== */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={`sheet ${sheetOpen ? 'open' : ''}`}
        id="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="মেনু"
      >
        <div className="sheet-top">
          <Link className="logo" href="#top" onClick={() => setSheetOpen(false)}>
            <span className="logo-mark" aria-hidden="true">প</span>
            <span className="logo-word">পড়া হবে<em>!</em></span>
          </Link>
          <button className="menu-btn" type="button" onClick={() => setSheetOpen(false)} style={{ display: 'inline-flex' }}>
            বন্ধ করো ✕
          </button>
        </div>
        <nav aria-label="মোবাইল মেনু">
          <a href="#top" onClick={() => setSheetOpen(false)}>হোম <small>শুরু থেকে</small></a>
          <a href="#how" onClick={() => setSheetOpen(false)}>কীভাবে কাজ করে <small>লাইভ ডেমো</small></a>
          <a href="#features" onClick={() => setSheetOpen(false)}>ফিচারসমূহ <small>৮টি অংশ</small></a>
          <a href="#about" onClick={() => setSheetOpen(false)}>আমাদের সম্পর্কে <small>কারা আমরা</small></a>
        </nav>
        <p className="sheet-quip">প্যাঁচ যতই থাকুক, পড়া হবে!</p>
        <div className="sheet-foot">
          <Link className="btn btn-lg" href="/register" onClick={() => setSheetOpen(false)}>
            চলো, পড়া শুরু করি! <span className="arr">→</span>
          </Link>
          <Link className="login" href="/login" onClick={() => setSheetOpen(false)}>লগইন</Link>
        </div>
      </div>

      <main>
        {/* ===================== 01 HERO ===================== */}
        <section className="hero" id="top" aria-labelledby="hero-h">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="kicker">
                  <span className="dot" />
                  তোমার নিজের AI Home Tutor · ক্লাস ৬–১২
                </p>
                <h1 className="h-hero" id="hero-h">
                  পড়ার{' '}
                  <span className="circled">
                    সিন
                    <svg viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M150 14C108 -2 30 8 12 46c-16 34 30 58 92 56 62-2 96-26 88-58C186 20 150 8 98 12" />
                    </svg>
                  </span>{' '}
                  এবার<br />
                  <span className="hl">বদলে যাবে!</span>
                </h1>
                <p className="lede">
                  তোমার নিজের AI Home Tutor। পড়বে, বুঝবে, প্রশ্ন করবে, ভুল করবে, আবার শিখবে। সবকিছু তোমার নিজের গতিতে।
                </p>
                <div className="cta-row">
                  <Link className="btn btn-lg" href="/register">
                    চলো, পড়া শুরু করি! <span className="arr" aria-hidden="true">→</span>
                  </Link>
                  <a className="btn-line" href="#how">
                    কীভাবে কাজ করে?
                  </a>
                </div>
                <ul className="trust">
                  <li>বাংলা মিডিয়াম ও ইংলিশ ভার্সন</li>
                  <li>বই ধরে, অধ্যায় ধরে</li>
                  <li>অভিভাবকের জন্য সাপ্তাহিক রিপোর্ট</li>
                </ul>
              </div>

              <div className="hero-visual">
                <div className="sticker" role="note">
                  <svg viewBox="0 0 40 40" aria-hidden="true">
                    <path
                      d="M20 20c0-2 2-3 3.5-2s1.5 4-1 5.5-6 .5-7-3 1.5-7.5 5.5-8 9 2 9.5 7-3 10-8.5 10.5S10 27 9.5 21 13 9.5 19.5 9"
                      fill="none"
                      stroke="#241600"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <b>প্যাঁচ যতই থাকুক, পড়া হবে!</b>
                </div>

                <div className="scene">
                  <svg viewBox="0 0 520 560" role="img" aria-label="রাতে পড়ার টেবিলে বসে ল্যাপটপে অঙ্ক করছে এক শিক্ষার্থী; পাশে টেবিল ল্যাম্প, জানালার গ্রিল আর এক গ্লাস চা">
                    <defs>
                      <radialGradient id="lg" cx="0.42" cy="0.05" r="0.95">
                        <stop offset="0" stopColor="#FFB238" stopOpacity=".55" />
                        <stop offset=".55" stopColor="#FFB238" stopOpacity=".12" />
                        <stop offset="1" stopColor="#FFB238" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#0A2427" />
                        <stop offset="1" stopColor="#173B37" />
                      </linearGradient>
                      <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#FFF6DE" />
                        <stop offset="1" stopColor="#F7DDA0" />
                      </linearGradient>
                      <radialGradient id="sg" cx=".5" cy=".5" r=".6">
                        <stop offset="0" stopColor="#FFE7B0" stopOpacity=".35" />
                        <stop offset="1" stopColor="#FFE7B0" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="tea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#E08A2B" />
                        <stop offset="1" stopColor="#8A3E10" />
                      </linearGradient>
                    </defs>
                    <rect width="520" height="560" fill="#12201B" />
                    {/* Dhaka-style window grill */}
                    <rect x="286" y="36" width="196" height="214" rx="6" fill="url(#sky)" />
                    <circle cx="432" cy="88" r="17" fill="#F3EBD5" opacity=".9" />
                    <circle cx="425" cy="84" r="16" fill="#0E2A2B" opacity=".9" />
                    <circle cx="330" cy="70" r="1.6" fill="#F3EBD5" />
                    <circle cx="372" cy="118" r="1.2" fill="#F3EBD5" />
                    <circle cx="458" cy="160" r="1.4" fill="#F3EBD5" />
                    <g stroke="#2E4B42" strokeWidth="3" fill="none">
                      <path d="M310 36v214M335 36v214M360 36v214M384 36v214M408 36v214M433 36v214M458 36v214" />
                      <path d="M286 108h196M286 178h196" />
                      <path d="M335 143c0-14 25-14 25 0s-25 14-25 0zM408 143c0-14 25-14 25 0s-25 14-25 0z" />
                      <path d="M360 72c12 0 12 18 24 18s12-18 24-18" />
                      <path d="M360 214c12 0 12 18 24 18s12-18 24-18" />
                    </g>
                    <rect x="286" y="36" width="196" height="214" rx="6" fill="none" stroke="#24392F" strokeWidth="8" />
                    {/* Lamp Light */}
                    <polygon className="glow" points="128,150 -40,470 360,470" fill="url(#lg)" />
                    {/* Desk */}
                    <rect x="0" y="440" width="520" height="120" fill="#24190F" />
                    <rect x="0" y="440" width="520" height="4" fill="#3A2A1A" />
                    {/* Lamp */}
                    <ellipse cx="92" cy="440" rx="40" ry="8" fill="#0B1310" />
                    <path d="M92 436 L66 300 L128 168" stroke="#0B1310" strokeWidth="8" fill="none" strokeLinecap="round" />
                    <circle cx="66" cy="300" r="7" fill="#0B1310" />
                    <path d="M100 150 L160 132 L170 172 Q140 190 112 178 Z" fill="#0B1310" />
                    <ellipse cx="140" cy="176" rx="22" ry="6" fill="#FFD27A" opacity=".85" />
                    {/* Laptop with equation */}
                    <rect x="198" y="296" width="208" height="136" rx="8" fill="#0B1310" />
                    <rect x="206" y="304" width="192" height="120" rx="3" fill="url(#scr)" />
                    <ellipse cx="302" cy="364" rx="160" ry="110" fill="url(#sg)" />
                    <text x="222" y="336" style={{ fontFamily: 'var(--f-hand)' }} fontSize="22" fill="#22408F">2x + 5 = 15</text>
                    <rect x="222" y="350" width="104" height="18" rx="9" fill="#14201B" opacity=".85" />
                    <rect x="290" y="374" width="94" height="18" rx="9" fill="#FFB238" />
                    <rect x="222" y="398" width="70" height="12" rx="6" fill="#14201B" opacity=".25" />
                    <path d="M184 432 h236 l-12 10 h-212z" fill="#1A2620" />
                    {/* Tea glass */}
                    <ellipse cx="438" cy="440" rx="24" ry="5" fill="#0B1310" />
                    <path d="M424 396 h30 l-4 42 h-22z" fill="rgba(237,232,218,.18)" stroke="rgba(237,232,218,.4)" strokeWidth="1.5" />
                    <path d="M425.5 408 h27 l-2.8 29 h-21.4z" fill="url(#tea)" />
                    <path className="steam" d="M432 388c-6-8 6-12 0-20" />
                    <path className="steam s2" d="M445 390c-6-8 6-12 0-20" />
                    {/* Textbooks */}
                    <rect x="470" y="420" width="62" height="20" rx="2" fill="#7A2E2A" />
                    <rect x="466" y="402" width="62" height="18" rx="2" fill="#1F4F44" />
                    <rect x="474" y="386" width="58" height="16" rx="2" fill="#C78B2A" />
                    <text x="478" y="415" style={{ fontFamily: 'var(--f-body)' }} fontSize="10" fill="#F3EBD5">গণিত</text>
                    {/* Student over-the-shoulder */}
                    <path d="M40 560 C46 488 104 474 176 474 C248 474 300 488 310 560 Z" fill="#0A110E" />
                    <path d="M120 478 C150 492 200 492 232 478" stroke="#1C2D26" strokeWidth="3" fill="none" />
                    <circle cx="176" cy="420" r="52" fill="#0A110E" />
                    <ellipse cx="146" cy="380" rx="22" ry="20" fill="#0A110E" />
                    <path d="M216 400 c10 6 14 18 10 30" stroke="#FFB238" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="hero-chat" aria-label="টিউটরের সাথে কথোপকথনের নমুনা">
                  <div className="hc-top">
                    <span><b>গণিত</b> · সরল সমীকরণ</span>
                    <span className="hc-prog" aria-label="৫টির মধ্যে ৪টি ধাপ শেষ">
                      <i className="on" /><i className="on" /><i className="on" /><i className="on" /><i />
                    </span>
                  </div>
                  <div className="bub t">চলো দেখি, 2x + 5 = 15 হলে x-এর মান কত?</div>
                  <div className="bub s">x = 5!</div>
                  <div className="bub win">একদম ঠিক! চ্যাপ্টার ক্লিয়ার, বস!</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== TICKER ===================== */}
        <div className="ticker select-none" aria-hidden="true">
          <div className="ticker-track">
            <span>এই তো! মাথায় ঢুকছে!</span>
            <span>ভুল থেকে Level Up!</span>
            <span>চ্যাপ্টার ক্লিয়ার, বস!</span>
            <span>আজকে পড়া হবে, বুঝেও হবে!</span>
            <span>প্যাঁচ যতই থাকুক, পড়া হবে!</span>
            <span>এই তো! মাথায় ঢুকছে!</span>
            <span>ভুল থেকে Level Up!</span>
            <span>চ্যাপ্টার ক্লিয়ার, বস!</span>
            <span>আজকে পড়া হবে, বুঝেও হবে!</span>
            <span>প্যাঁচ যতই থাকুক, পড়া হবে!</span>
          </div>
        </div>

        {/* ===================== 02 STATEMENT ===================== */}
        <section className="statement" id="features" aria-labelledby="st-h">
          <div className="wrap">
            <div className="st-top">
              <h2 className="h-xl" id="st-h">
                শুধু পড়া নয়, এবার শেখা{' '}
                <span className="squig">
                  জমবে!
                  <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 12c18-10 30 8 48 0s30-10 48 0 30 8 48 0 30-10 50 0" />
                  </svg>
                </span>
              </h2>
              <p className="lede">
                এখানে শুধু উত্তর মুখস্থ করতে হবে না। প্রতিটি বিষয় বুঝে শেখা, নিজের হাতে সমাধান করা আর ভুল থেকে আরও ভালো হওয়ার সুযোগ আছে।
              </p>
            </div>

            <ul className="ways">
              <li className="way">
                <div className="way-word">
                  বুঝে <span className="outline">শেখো</span>
                </div>
                <p>
                  <b>কঠিন বিষয় সহজভাবে বুঝে নাও।</b>
                  বইয়ের ভাষা কঠিন লাগলে Tutor সেটা তোমার ভাষায় বলবে।
                </p>
                <div className="demo">
                  পাতা দিয়ে গাছ <span className="term" tabIndex={0}>সালোকসংশ্লেষণ</span> করে।
                  <div className="tip">
                    <i>?</i>
                    <span>মানে গাছের নিজের রান্নাঘর: আলো + পানি + CO₂ দিয়ে নিজের খাবার বানায়।</span>
                  </div>
                </div>
              </li>

              <li className="way">
                <div className="way-word">
                  প্রশ্ন করে <span className="outline">শেখো</span>
                </div>
                <p>
                  <b>প্রতিটি লেসনে থাকবে ইন্টারঅ্যাকশন।</b>
                  &ldquo;কেন?&rdquo; জিজ্ঞেস করতে লজ্জা নেই। যতবার খুশি।
                </p>
                <div className="demo">
                  <span style={{ color: 'var(--chalk-3)', fontSize: '.85rem' }}>বুঝতে পারোনি? চাপ দাও:</span>
                  <div className="chips" role="group" aria-label="প্রশ্নের ধরন">
                    {['কেন এমন হয়?', 'উদাহরণ দাও', 'আরেকটু সহজ করে'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="chip"
                        aria-pressed={selectedChip === chip}
                        onClick={() => setSelectedChip(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </li>

              <li className="way">
                <div className="way-word">
                  ভুল থেকে <span className="outline">শেখো</span>
                </div>
                <p>
                  <b>ভুল হলেই পাবে সঠিক ব্যাখ্যা ও নতুন অনুশীলন।</b>
                  ভুলটা কোথায়, সেটা আগে বোঝো। তারপর আবার চেষ্টা।
                </p>
                <div className="demo">
                  <div className="wrongfix">
                    <span>৭ × ৮ =</span> <s>৫৪</s> <span className="ok">৫৬ ✓</span>
                    <small>৭-এর ঘরের নামতা নিয়ে আরও ৩টা প্র্যাকটিস যোগ হলো</small>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* ===================== 03 TUTOR ===================== */}
        <section className="tutor" id="how" aria-labelledby="tu-h">
          <div className="wrap">
            <div className="tutor-head">
              <div className="sec-head">
                <p className="kicker"><span className="dot" />কীভাবে কাজ করে</p>
                <h2 className="h-xl" id="tu-h">
                  প্যাঁচ যতই থাকুক, <span className="mark">পড়া হবে!</span>
                </h2>
                <p className="lede">
                  বইয়ের কঠিন অঙ্ক হোক কিংবা বিজ্ঞানের জটিল কোনো বিষয়, তোমার AI Tutor ধাপে ধাপে বুঝিয়ে দেবে।
                </p>
              </div>
            </div>

            <div className="app" id="tutorApp">
              <div className="app-bar">
                <b>গণিত</b>
                <span className="sep">/</span>
                <span>অধ্যায় ৫: সরল সমীকরণ</span>
                <span className="sep">/</span>
                <span>অনুশীলনী ৫.১</span>
                <span className="live">Tutor অনলাইন</span>
              </div>
              <div className="app-body">
                <div className="boardpane">
                  <p className="bp-label">বোর্ড · ধাপে ধাপে সমাধান</p>
                  <ol className="steps" id="steps">
                    <li className="step done">
                      <div>
                        <span className="eq">2x + 5 = 15</span>
                        <span className="why">প্রশ্নটা লিখে নিলাম</span>
                      </div>
                    </li>
                    <li className="step done">
                      <div>
                        <span className="eq">2x = 10</span>
                        <span className="why">দুই পাশ থেকে 5 বাদ</span>
                      </div>
                    </li>
                    <li className="step done">
                      <div>
                        <span className="eq">x = 5</span>
                        <span className="why">দুই পাশকে 2 দিয়ে ভাগ</span>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="chatpane">
                  <div className="msgs" id="msgs" aria-live="polite">
                    <div className="msg t">
                      <span className="ava" aria-hidden="true">প</span>
                      <div className="bub t">চলো দেখি, 2x + 5 = 15 হলে x-এর মান কত?</div>
                    </div>
                    <div className="msg s">
                      <span className="ava" aria-hidden="true">না</span>
                      <div className="bub s">10?</div>
                    </div>
                    <div className="msg t">
                      <span className="ava" aria-hidden="true">প</span>
                      <div className="bub t">একটু চিন্তা করো! প্রথমে দুই পাশ থেকে 5 বাদ দিলে কী থাকে?</div>
                    </div>
                    <div className="hint">হিন্ট: x-কে একা করতে হলে আগে +5 সরাতে হবে</div>
                    <div className="msg s">
                      <span className="ava" aria-hidden="true">না</span>
                      <div className="bub s">2x = 10!</div>
                    </div>
                    <div className="msg t">
                      <span className="ava" aria-hidden="true">প</span>
                      <div className="bub t">এই তো! মাথায় ঢুকছে! এবার দুই পাশকে 2 দিয়ে ভাগ করো।</div>
                    </div>
                    <div className="msg s">
                      <span className="ava" aria-hidden="true">না</span>
                      <div className="bub s">x = 5!</div>
                    </div>
                    <div className="msg t">
                      <span className="ava" aria-hidden="true">প</span>
                      <div className="bub win">একদম ঠিক! চ্যাপ্টার ক্লিয়ার, বস!</div>
                    </div>
                  </div>
                  <div className="composer">
                    <div className="field">উত্তর লেখো বা প্রশ্ন করো…</div>
                    <button
                      className="replay"
                      id="replay"
                      type="button"
                      onClick={() => playTutorRef.current()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      আবার দেখাও
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 04 MISTAKES ===================== */}
        <section className="mistakes" aria-labelledby="mi-h">
          <div className="wrap">
            <div className="mist-grid">
              <div className="mist-copy">
                <p className="kicker"><span className="dot" />ভুল করাটাও পড়ার অংশ</p>
                <h2 className="h-xl" id="mi-h">
                  ভুল হইছে? সমস্যা নাই, <span className="mark">আবার হবে!</span>
                </h2>
                <p className="lede">
                  ভুল করা মানেই তুমি পারো না, এমন নয়। ভুল থেকেই শেখা শুরু হয়। তোমার Tutor বুঝবে কোথায় সমস্যা হচ্ছে এবং আবার বুঝিয়ে দেবে।
                </p>
                <ul className="fixlist">
                  <li><b>কোথায়</b><span>ঠিক কোন লাইনে গড়বড়, সেটা ধরিয়ে দেবে</span></li>
                  <li><b>কেন</b><span>নিয়মটা আবার বুঝিয়ে দেবে, অন্য উদাহরণ দিয়ে</span></li>
                  <li><b>আবার</b><span>একই ধরনের নতুন প্রশ্ন দেবে, যতক্ষণ না পোক্ত হয়</span></li>
                </ul>
              </div>

              <div className="khata-wrap">
                <div className="stamp">ভুল থেকে Level Up!</div>
                <div className="khata" role="img" aria-label="খাতায় অঙ্ক: 3(x − 2) = 12। প্রথম চেষ্টায় 3x − 2 লেখা ভুল, লাল কালিতে কেটে মার্জিনে লেখা ৩ দিয়ে দুইটাকেই গুণ করতে হবে। পরে সঠিক সমাধান x = 6।">
                  <div className="holes" aria-hidden="true">
                    <i /><i /><i /><i />
                  </div>
                  <span className="line q">প্রশ্ন ৩। সমাধান করো: 3(x − 2) = 12</span>
                  <span className="line">
                    <span className="bad">3x − 2 = 12</span>
                    <span className="note">৩ দিয়ে দুইটাকেই গুণ করতে হবে!</span>
                  </span>
                  <span className="line">3x − 6 = 12</span>
                  <span className="line">3x = 18</span>
                  <span className="line good">
                    x = 6{' '}
                    <svg className="tickmark" viewBox="0 0 30 20" aria-hidden="true">
                      <path d="M2 10l8 8L28 2" fill="none" stroke="#1D7A45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="line" style={{ color: '#5B5A52', fontSize: '.8em' }}>
                    ২য় চেষ্টায় সঠিক · ৩০ সেকেন্ড কম সময়ে
                  </span>
                </div>
                <div className="postit">
                  এই তো!<br />মাথায় ঢুকছে!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 05 PROGRESS ===================== */}
        <section className="progress" aria-labelledby="pr-h">
          <div className="wrap">
            <div className="sec-head">
              <p className="kicker"><span className="dot" />তোমার অগ্রগতি</p>
              <h2 className="h-xl" id="pr-h">
                পড়ো একটু, <span className="mark">এগিয়ে যাও</span> অনেকটা!
              </h2>
              <p className="lede">
                প্রতিদিনের ছোট ছোট শেখাই তোমাকে নিয়ে যাবে বড় সাফল্যের দিকে। নিজের পড়ার অগ্রগতি নিজেই দেখো।
              </p>
            </div>

            <div className="dash">
              <div className="panel p-hello">
                <div>
                  <h3>শুভ সন্ধ্যা, নাদিয়া</h3>
                  <p>ক্লাস ৮ · আজকের লক্ষ্যের আর ১৩ মিনিট বাকি</p>
                </div>
                <span className="sample">নমুনা ড্যাশবোর্ড · উদাহরণ ডেটা</span>
              </div>

              <div className="panel p-streak">
                <p className="p-label">
                  <span>টানা পড়ার স্ট্রিক</span>
                  <span>এই মাস</span>
                </p>
                <div className="big">১২ <small>দিন</small></div>
                <div className="days" aria-label="গত চার সপ্তাহের পড়ার দিন">
                  <i className="l1" /><i className="l2" /><i /><i className="l1" /><i className="l2" /><i className="l3" /><i />
                  <i className="l2" /><i className="l1" /><i className="l2" /><i className="l3" /><i className="l1" /><i className="l2" /><i className="l1" />
                  <i className="l3" /><i className="l2" /><i className="l2" /><i className="l1" /><i className="l3" /><i className="l2" /><i className="l3" />
                  <i className="l2" /><i className="l3" /><i className="l1" /><i className="l2 today" /><i /><i /><i />
                </div>
                <div className="daynames">
                  <span>শ</span><span>র</span><span>সো</span><span>ম</span><span>বু</span><span>বৃ</span><span>শু</span>
                </div>
              </div>

              <div className="panel p-time">
                <p className="p-label">
                  <span>এই সপ্তাহে পড়ার সময়</span>
                  <span style={{ color: 'var(--tick)' }}>গত সপ্তাহের চেয়ে ৪০ মি বেশি</span>
                </p>
                <div className="big">৬ <small>ঘণ্টা</small> ৪০ <small>মিনিট</small></div>
                <svg className="weekchart" viewBox="0 0 420 150" role="img" aria-label="দিনভিত্তিক পড়ার সময়: শনি ৫০, রবি ৬৫, সোম ৪০, মঙ্গল ৮০, বুধ ৭০, বৃহস্পতি ৯৫ মিনিট">
                  <line className="gl" x1="0" x2="420" y1="20" y2="20" />
                  <line className="gl" x1="0" x2="420" y1="70" y2="70" />
                  <text x="0" y="15">১০০ মি</text>
                  <text x="0" y="65">৫০ মি</text>
                  <g>
                    <rect className="bar" x="40" y="70" width="38" height="50" rx="6" />
                    <rect className="bar" x="102" y="55" width="38" height="65" rx="6" />
                    <rect className="bar" x="164" y="80" width="38" height="40" rx="6" />
                    <rect className="bar" x="226" y="40" width="38" height="80" rx="6" />
                    <rect className="bar" x="288" y="50" width="38" height="70" rx="6" />
                    <rect className="bar hi" x="350" y="25" width="38" height="95" rx="6" />
                  </g>
                  <text className="val" x="369" y="18" textAnchor="middle">৯৫</text>
                  <g textAnchor="middle">
                    <text x="59" y="142">শনি</text>
                    <text x="121" y="142">রবি</text>
                    <text x="183" y="142">সোম</text>
                    <text x="245" y="142">মঙ্গল</text>
                    <text x="307" y="142">বুধ</text>
                    <text x="369" y="142">বৃহঃ</text>
                  </g>
                </svg>
              </div>

              <div className="panel p-goal">
                <svg className="ring" viewBox="0 0 140 140" role="img" aria-label="আজকের লক্ষ্য ৪৫ মিনিটের মধ্যে ৩২ মিনিট শেষ">
                  <circle className="bg" cx="70" cy="70" r="58" />
                  <circle className="fg" id="goalRing" cx="70" cy="70" r="58" strokeDasharray="364.4" strokeDashoffset="105.7" />
                  <text x="70" y="74">৩২/৪৫</text>
                  <text className="sub" x="70" y="94">মিনিট</text>
                </svg>
                <div>
                  <p className="p-label" style={{ justifyContent: 'center', margin: 0 }}>আজকের লক্ষ্য</p>
                  <span style={{ fontSize: '.9rem', color: 'var(--chalk-2)' }}>আর একটা লেসন!</span>
                </div>
              </div>

              <div className="panel p-subj">
                <p className="p-label">
                  <span>বিষয়ভিত্তিক অগ্রগতি</span>
                  <span>শেষ ১৮/৪২ অধ্যায়</span>
                </p>
                <div className="subj">
                  <div className="srow">
                    <span>গণিত<small>সরল সমীকরণ চলছে</small></span>
                    <div className="track"><div className="fill" style={{ width: '72%' }} /></div>
                    <span className="pc">৭২%</span>
                  </div>
                  <div className="srow">
                    <span>বিজ্ঞান<small>আলোর প্রতিফলন</small></span>
                    <div className="track"><div className="fill" style={{ width: '58%' }} /></div>
                    <span className="pc">৫৮%</span>
                  </div>
                  <div className="srow">
                    <span>ইংরেজি<small>Tense, Voice</small></span>
                    <div className="track"><div className="fill" style={{ width: '45%' }} /></div>
                    <span className="pc">৪৫%</span>
                  </div>
                  <div className="srow">
                    <span>ICT<small>নেটওয়ার্ক</small></span>
                    <div className="track"><div className="fill" style={{ width: '80%' }} /></div>
                    <span className="pc">৮০%</span>
                  </div>
                </div>
              </div>

              <div className="panel p-next">
                <p className="p-label">
                  <span>সামনের লেসন</span>
                  <span>৩টি</span>
                </p>
                <ul className="next">
                  <li>
                    <time>আজ ৭:৩০</time>
                    <span>আলোর প্রতিফলন<small>বিজ্ঞান · ২০ মিনিট</small></span>
                  </li>
                  <li>
                    <time>কাল</time>
                    <span>বীজগাণিতিক রাশি<small>গণিত · অনুশীলনী ৫.২</small></span>
                  </li>
                  <li>
                    <time>শুক্রবার</time>
                    <span>অধ্যায়ভিত্তিক মডেল টেস্ট<small>গণিত · ৩০ মিনিট</small></span>
                  </li>
                </ul>
              </div>

              <div className="panel p-parent">
                <span className="who">অভিভাবকদের জন্য</span>
                <p>
                  সন্তান কতক্ষণ পড়ল, কোন অধ্যায়ে আটকে আছে, পরীক্ষায় কেমন করল, সব থাকে সাপ্তাহিক রিপোর্টে। নম্বরের চেয়ে বেশি দেখাবে বোঝার উন্নতি।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 06 ACHIEVEMENT ===================== */}
        <section className="ach" aria-labelledby="ac-h">
          <div className="wrap">
            <div className="sec-head">
              <p className="kicker"><span className="dot" />অর্জন</p>
              <h2 className="h-xl" id="ac-h">
                চ্যাপ্টার খতম, <span className="mark">কনফিডেন্স ডাবল!</span>
              </h2>
              <p className="lede">
                একটা একটা করে চ্যাপ্টার শেষ করো, নিজের স্কিল বাড়াও আর প্রতিটি অর্জন উদযাপন করো।
              </p>
            </div>

            <div className="ach-grid">
              <div className="done-card" id="doneCard">
                <canvas ref={confettiCanvasRef} id="confetti" aria-hidden="true" />
                <div className="dc-top">
                  <div>
                    গণিত · ক্লাস ৮
                    <b>অধ্যায় ৫: সরল সমীকরণ</b>
                  </div>
                  <span>১১টি লেসন</span>
                </div>
                <div className="dc-mid">
                  <svg className="dc-ring" viewBox="0 0 140 140" aria-hidden="true">
                    <circle className="bg" cx="70" cy="70" r="58" />
                    <circle className="fg" id="dcRing" cx="70" cy="70" r="58" strokeDasharray="364.4" strokeDashoffset="0" />
                    <text x="70" y="81" id="dcPct">১০০%</text>
                  </svg>
                  <p className="dc-say">
                    চ্যাপ্টার <em>ক্লিয়ার,</em><br />বস!
                  </p>
                </div>
                <div className="dc-stats">
                  <div><b>১৮/২০</b>শেষ কুইজ</div>
                  <div><b>৯</b>ভুল থেকে শেখা</div>
                  <div><b>৩ ঘ</b>মোট সময়</div>
                </div>
                <button className="celebrate" id="celebrate" type="button" onClick={fireConfetti}>
                  আবার উদযাপন করো
                </button>
              </div>

              <div className="ach-side">
                <div className="path">
                  <p className="p-label">
                    <span>গণিতের পথ · ক্লাস ৮</span>
                    <span>৫/৮ অধ্যায়</span>
                  </p>
                  <ol>
                    <li className="d"><i>১</i>মূলদ সংখ্যা</li>
                    <li className="d"><i>২</i>সূচক</li>
                    <li className="d"><i>৩</i>রাশি</li>
                    <li className="d"><i>৪</i>উৎপাদক</li>
                    <li className="now"><i>৫</i>সমীকরণ</li>
                    <li><i>৬</i>সেট</li>
                    <li><i>৭</i>জ্যামিতি</li>
                    <li><i>৮</i>পরিসংখ্যান</li>
                  </ol>
                </div>

                <div className="badges">
                  <div className="badge-item">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <path d="M30 3l6 5 8-1 3 7 7 4-1 8 5 6-5 6 1 8-7 4-3 7-8-1-6 5-6-5-8 1-3-7-7-4 1-8-5-6 5-6-1-8 7-4 3-7 8 1z" fill="#FFB238" />
                      <text x="30" y="37" textAnchor="middle" style={{ fontFamily: 'var(--f-display)' }} fontWeight="800" fontSize="18" fill="#241600">৭</text>
                    </svg>
                    ৭ দিনের স্ট্রিক
                  </div>
                  <div className="badge-item">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <circle cx="30" cy="30" r="26" fill="none" stroke="#7FD6A0" strokeWidth="3" strokeDasharray="4 4" />
                      <circle cx="30" cy="30" r="19" fill="#7FD6A0" />
                      <path d="M21 30l6 6 12-12" fill="none" stroke="#0D1814" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    প্রথম ১০০% কুইজ
                  </div>
                  <div className="badge-item">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <rect x="6" y="6" width="48" height="48" rx="14" fill="#EDE8DA" transform="rotate(8 30 30)" />
                      <path d="M20 38l10-16 10 16" fill="none" stroke="#FF6152" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M30 22v20" stroke="#0D1814" strokeWidth="3" />
                    </svg>
                    ভুল থেকে Level Up ×২৫
                  </div>
                  <div className="badge-item locked">
                    <svg viewBox="0 0 60 60" aria-hidden="true">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="#B5B9AA" strokeWidth="2.5" />
                      <path d="M36 18a13 13 0 1 0 6 18 10 10 0 0 1-6-18z" fill="#B5B9AA" />
                    </svg>
                    নিশাচর পড়ুয়া<br /><small>বাকি ২ রাত</small>
                  </div>
                </div>

                <p className="quote">
                  <b>&ldquo;অধ্যায় ৪ তিনবার আটকেছিলাম। এবার ভুলগুলো ধরে ধরে বুঝিয়েছে।&rdquo;</b><br />
                  নমুনা উক্তি · প্রকৃত শিক্ষার্থীর মতামত এখানে বসবে
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 07 EXAM ===================== */}
        <section className="exam" id="exam" aria-labelledby="ex-h">
          <div className="wrap">
            <div className="exam-grid">
              <div className="exam-copy">
                <p className="kicker"><span className="dot" />পরীক্ষা</p>
                <h2 className="h-lg" id="ex-h">
                  পরীক্ষার প্রস্তুতি? <span className="mark">এবার সিরিয়াসলি হবে!</span>
                </h2>
                <p className="lede">
                  নিজের পছন্দের চ্যাপ্টার বেছে নাও, পরীক্ষা দাও, সময়ের মধ্যে উত্তর লেখো আর জেনে নাও কোথায় আরও প্র্যাকটিস দরকার।
                </p>
                <ul className="tags">
                  <li>অধ্যায়ভিত্তিক পরীক্ষা</li>
                  <li>MCQ ও সৃজনশীল</li>
                  <li>সময় ধরে পরীক্ষা</li>
                  <li>লিখিত খাতার ছবি আপলোড</li>
                  <li>ভুল চিহ্নিত করা</li>
                  <li>বিস্তারিত সমাধান</li>
                  <li>পারফরম্যান্স বিশ্লেষণ</li>
                </ul>
                <p className="honest">
                  হাতে লেখা খাতা AI দেখে ধাপে ধাপে মতামত দেয় এবং একটা প্রস্তাবিত নম্বর দেখায়। চূড়ান্ত নম্বর তুমি বা তোমার শিক্ষক রিভিউ করে নিতে পারবে।
                </p>
              </div>

              <div className="exam-ui">
                <div className="panel">
                  <div className="ex-top">
                    <div className="t">
                      মডেল টেস্ট
                      <b>গণিত · অধ্যায় ৫</b>
                    </div>
                    <div className="timer" aria-label="বাকি সময়">
                      <svg viewBox="0 0 36 36" aria-hidden="true">
                        <circle className="bg" cx="18" cy="18" r="14" />
                        <circle className="fg" id="tRing" cx="18" cy="18" r="14" strokeDasharray="88" strokeDashoffset={timerDashoffset} />
                      </svg>
                      <b id="timer">{bn(String(timeMinutes).padStart(2, '0'))}:{bn(String(timeSecs).padStart(2, '0'))}</b>
                    </div>
                  </div>

                  <div className="qnav" id="qnav" style={{ marginTop: '18px' }} aria-label="প্রশ্ন নেভিগেশন">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => {
                      const isAnswered = [1, 2, 3, 4, 5, 6, 8, 9].includes(qNum);
                      const isFlagged = qNum === 5;
                      const isCurrent = qNum === examCurrentQ;

                      let cls = '';
                      if (isCurrent) cls = 'cur';
                      else if (isFlagged) cls = 'f';
                      else if (isAnswered) cls = 'a';

                      return (
                        <button
                          key={qNum}
                          type="button"
                          className={cls}
                          aria-current={isCurrent ? 'true' : undefined}
                          onClick={() => setExamCurrentQ(qNum)}
                        >
                          {bn(qNum)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="legend" style={{ marginTop: '12px' }}>
                    <span><i className="la" />উত্তর দেওয়া</span>
                    <span><i className="lf" />পরে দেখবো</span>
                    <span><i className="lc" />এখন</span>
                    <span><i />বাকি</span>
                  </div>
                </div>

                <div className="qcard">
                  <div className="qh">
                    <span>প্রশ্ন {bn(examCurrentQ)} / ২০ · MCQ</span>
                    <span>১ নম্বর</span>
                  </div>
                  <p className="qt">
                    যদি <span className="m">3x − 7 = 11</span> হয়, তবে x-এর মান কত?
                  </p>
                  <fieldset className="opts">
                    <legend className="sr-only">একটি উত্তর বাছাই করো</legend>
                    <div className="opt">
                      <input
                        type="radio"
                        name="q7"
                        id="q7a"
                        checked={selectedOption === 'a'}
                        onChange={() => setSelectedOption('a')}
                      />
                      <label htmlFor="q7a"><i>ক</i>৪</label>
                    </div>
                    <div className="opt">
                      <input
                        type="radio"
                        name="q7"
                        id="q7b"
                        checked={selectedOption === 'b'}
                        onChange={() => setSelectedOption('b')}
                      />
                      <label htmlFor="q7b"><i>খ</i>৬</label>
                    </div>
                    <div className="opt">
                      <input
                        type="radio"
                        name="q7"
                        id="q7c"
                        checked={selectedOption === 'c'}
                        onChange={() => setSelectedOption('c')}
                      />
                      <label htmlFor="q7c"><i>গ</i>৮</label>
                    </div>
                    <div className="opt">
                      <input
                        type="radio"
                        name="q7"
                        id="q7d"
                        checked={selectedOption === 'd'}
                        onChange={() => setSelectedOption('d')}
                      />
                      <label htmlFor="q7d"><i>ঘ</i>১৮</label>
                    </div>
                  </fieldset>
                  <div className="qfoot">
                    <button type="button">পরে দেখবো</button>
                    <span>উত্তর সেভ হয়েছে</span>
                    <button type="button" className="nxt" onClick={() => setExamCurrentQ((prev) => (prev < 20 ? prev + 1 : 1))}>
                      পরের প্রশ্ন →
                    </button>
                  </div>
                </div>

                <div className="panel">
                  <p className="p-label">
                    <span>সৃজনশীল প্রশ্ন ২ (খ) · খাতার ছবি</span>
                    <span>মূল্যায়ন হয়েছে</span>
                  </p>
                  <div className="script" style={{ marginTop: '12px' }}>
                    <div className="mini-page" aria-hidden="true">
                      5x + 3 = 2x + 15<br />
                      5x − 2x = 15 − 3<br />
                      <span className="r">3x = 18 − 3</span><br />
                      3x = 12<br />
                      x = 4
                      <span className="ring-mark" />
                    </div>
                    <div>
                      <ul className="fb">
                        <li className="ok"><span><b>ধাপ ১–২ ঠিক আছে।</b> x-গুলো এক পাশে আনা সুন্দর হয়েছে।</span></li>
                        <li className="no"><span><b>ধাপ ৩-এ ৩ দুইবার বাদ গেছে।</b> 15 − 3 = 12 আগেই করা হয়ে গিয়েছিল।</span></li>
                        <li className="tip2"><span><b>প্র্যাকটিস:</b> পক্ষান্তর নিয়ে ৪টি প্রশ্ন যোগ করা হলো।</span></li>
                      </ul>
                      <div className="score-sug">
                        <span>প্রস্তাবিত নম্বর</span>
                        <b>২/৩</b>
                        <span>· রিভিউ করো</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 08 GROUP ===================== */}
        <section className="group" id="group" aria-labelledby="gr-h">
          <div className="wrap">
            <div className="grp-grid">
              <div className="room" aria-label="গ্রুপ ক্লাসের নমুনা">
                <div className="room-bar">
                  <span><b>পড়ার আড্ডা</b> · বিজ্ঞান: আলোর প্রতিফলন</span>
                  <span>৪ জন বন্ধু · ১২:০৪</span>
                </div>
                <div className="tiles">
                  <div className="tile raised">
                    <span className="hand-up" aria-label="হাত তুলেছে">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 13V6a1.5 1.5 0 0 1 3 0v5V4a1.5 1.5 0 0 1 3 0v7V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 13a1.5 1.5 0 0 1 2.5-1.5L8 14" fill="none" stroke="#241600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div className="who">
                      <span className="av" style={{ background: '#FFB238' }}>রা</span>
                      <span className="nm">রাফি<small>ক্লাস ৯</small></span>
                    </div>
                    <span className="st">হাত তুলেছে: &ldquo;আপতন কোণ কোনটা?&rdquo;</span>
                  </div>

                  <div className="tile tutor-t">
                    <div className="tutor-mark" aria-hidden="true">প</div>
                    <div className="wave" aria-hidden="true">
                      <i /><i /><i /><i /><i /><i /><i />
                    </div>
                    <p className="say">&ldquo;রাফি, ভালো প্রশ্ন! আয়নার লম্বের সাথে আলো যে কোণ করে, সেটাই।&rdquo;</p>
                  </div>

                  <div className="tile">
                    <div className="who">
                      <span className="av" style={{ background: '#7FD6A0' }}>তি</span>
                      <span className="nm">তিশা<small>ক্লাস ৯</small></span>
                    </div>
                    <span className="st" style={{ color: 'var(--tick)' }}>কুইজ ৩/৩ সঠিক</span>
                  </div>

                  <div className="tile">
                    <div className="who">
                      <span className="av" style={{ background: '#EDE8DA' }}>আ</span>
                      <span className="nm">আরিয়ান<small>ক্লাস ৯</small></span>
                    </div>
                    <span className="st">ব্যক্তিগত প্রশ্ন পাঠিয়েছে</span>
                  </div>

                  <div className="tile">
                    <div className="who">
                      <span className="av" style={{ background: '#F59A8E' }}>মী</span>
                      <span className="nm">মীম<small>ক্লাস ৯</small></span>
                    </div>
                    <span className="st">শুনছে · নোট নিচ্ছে</span>
                  </div>
                </div>

                <div className="queue">
                  <b>প্রশ্নের লাইন</b>
                  <span className="q"><i style={{ background: '#FFB238' }}>রা</i>এখন</span>
                  <span className="q"><i style={{ background: '#EDE8DA' }}>আ</i>পরে</span>
                  <span style={{ marginLeft: 'auto' }}>সবার স্কোর আলাদা ট্র্যাক হচ্ছে</span>
                </div>
              </div>

              <div className="grp-copy">
                <p className="kicker"><span className="dot" />একা পড়ো বা বন্ধুদের সাথে</p>
                <h2 className="h-lg" id="gr-h">
                  বন্ধুদের নিয়ে <span className="mark">পড়ার আড্ডাও</span> হবে!
                </h2>
                <p className="lede">
                  বন্ধুদের ইনভাইট করো, একসাথে শেখো, প্রশ্ন করো আর একে অপরের সাথে এগিয়ে যাও।
                </p>
                <ul className="feat2">
                  <li>বন্ধুদের ইনভাইট</li>
                  <li>গ্রুপ টিউটরিং</li>
                  <li>নিজের আলাদা প্রশ্ন</li>
                  <li>লাইভ গ্রুপ সেশন</li>
                  <li>হাত তোলার সুবিধা</li>
                  <li>প্রত্যেকের আলাদা অগ্রগতি</li>
                </ul>
                <div className="invite">
                  <span>আড্ডা কোড</span>
                  <code id="code">ADDA-724</code>
                  <button type="button" id="copyBtn" onClick={handleCopyCode}>
                    {copiedCode ? 'কপি হয়েছে ✓' : 'কপি করো'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 09 FINAL ===================== */}
        <section className="final" id="start" aria-labelledby="fi-h">
          <canvas ref={dustCanvasRef} id="dust" aria-hidden="true" />
          <div className="ghost" aria-hidden="true">পড়া হবে!</div>
          <div className="wrap">
            <div className="final-in">
              <p className="kicker"><span className="dot" />পড়া হবে তো?</p>
              <h2 className="h-hero" id="fi-h">
                পড়ার সিন এবার<br />
                <span className="hl" style={{ color: 'var(--marigold)' }}>বদলে যাবে!</span>
              </h2>
              <p className="lede">
                নিজের মতো করে শেখা শুরু করো। প্রতিটি চ্যাপ্টার, প্রতিটি প্রশ্ন আর প্রতিটি ভুল তোমাকে নিয়ে যাবে আরও এক ধাপ সামনে।
              </p>
              <Link className="btn btn-lg" href="/register">
                চলো, পড়া শুরু করি! <span className="arr" aria-hidden="true">→</span>
              </Link>
              <p className="scribble">
                <svg viewBox="0 0 60 30" aria-hidden="true">
                  <path d="M4 24c14-2 30-8 46-18M50 6l-10 1M50 6l-2 10" fill="none" stroke="#FFB238" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                আজকে পড়া হবে, বুঝেও হবে!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer id="about">
        <div className="wrap">
          <div className="ft">
            <div>
              <Link className="logo" href="#top">
                <span className="logo-mark" aria-hidden="true">প</span>
                <span className="logo-word">পড়া হবে<em>!</em></span>
              </Link>
              <p>
                আমরা বিশ্বাস করি, মুখস্থ না, বুঝে পড়াই আসল। তাই প্রতিটা শিক্ষার্থীর জন্য একজন ধৈর্যশীল Home Tutor, যে নিজের গতিতে শেখায়, বকা দেয় না, আর ভুলকে ভয় পেতে শেখায় না।
              </p>
            </div>
            <div>
              <h3>পড়া হবে!</h3>
              <ul>
                <li><a href="#how">কীভাবে কাজ করে</a></li>
                <li><a href="#features">ফিচারসমূহ</a></li>
                <li><Link href="/parent/billing">মূল্য</Link></li>
                <li><a href="#app">অ্যাপ ডাউনলোড</a></li>
              </ul>
            </div>
            <div>
              <h3>অভিভাবকদের জন্য</h3>
              <ul>
                <li><Link href="/parent/dashboard">সাপ্তাহিক রিপোর্ট</Link></li>
                <li><a href="#security">নিরাপত্তা ও গোপনীয়তা</a></li>
                <li><a href="#faq">প্রায়ই জিজ্ঞাসিত প্রশ্ন</a></li>
              </ul>
            </div>
            <div>
              <h3>যোগাযোগ</h3>
              <ul>
                <li><a href="#about">আমাদের সম্পর্কে</a></li>
                <li><a href="#help">সাহায্য কেন্দ্র</a></li>
                <li><a href="#facebook">ফেসবুক পেজ</a></li>
              </ul>
            </div>
          </div>
          <div className="ft-bot">
            <span>© ২০২৬ পড়া হবে! · PORA HOBE</span>
            <span>শর্তাবলি · গোপনীয়তা নীতি (PDPA ২০২৬)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
