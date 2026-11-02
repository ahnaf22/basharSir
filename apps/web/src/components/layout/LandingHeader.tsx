"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LandingHeader(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E2D8] bg-[#FAF7F2]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B2C] text-white shadow-xs transition group-hover:bg-[#134E39]">
            <Sparkles className="h-5 w-5 text-[#FF5C35]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl font-black tracking-tight text-[#0B3B2C] sm:text-2xl">
                পড়া হবে<span className="text-[#FF5C35]">!</span>
              </span>
              <span className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#FF5C35]">
                PORA HOBE
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#52635B]">
              তোমার নিজের AI Home Tutor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="font-bangla text-sm font-semibold text-[#18241E] transition hover:text-[#0B3B2C]"
          >
            হোম
          </Link>
          <a
            href="#how-it-works"
            className="font-bangla text-sm font-semibold text-[#52635B] transition hover:text-[#0B3B2C]"
          >
            কীভাবে কাজ করে
          </a>
          <a
            href="#features"
            className="font-bangla text-sm font-semibold text-[#52635B] transition hover:text-[#0B3B2C]"
          >
            ফিচারসমূহ
          </a>
          <a
            href="#about"
            className="font-bangla text-sm font-semibold text-[#52635B] transition hover:text-[#0B3B2C]"
          >
            আমাদের সম্পর্কে
          </a>
        </nav>

        {/* Right Action CTAs */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-[#D8D2C4] bg-white font-bangla font-bold text-[#18241E] hover:bg-[#F3EFE6]"
            >
              লগইন
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="sm"
              className="bg-[#0B3B2C] font-bangla font-bold text-white shadow-xs hover:bg-[#134E39]"
            >
              পড়া শুরু করো
              <ArrowRight className="ml-1.5 h-4 w-4 text-[#FF5C35]" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/login">
            <Button
              size="sm"
              className="bg-[#0B3B2C] px-3 py-1.5 font-bangla text-xs font-bold text-white"
            >
              লগইন
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#18241E] hover:bg-[#F3EFE6]"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E7E2D8] bg-[#FAF7F2] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bangla text-base font-semibold text-[#18241E]"
            >
              হোম
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bangla text-base font-semibold text-[#52635B]"
            >
              কীভাবে কাজ করে
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bangla text-base font-semibold text-[#52635B]"
            >
              ফিচারসমূহ
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bangla text-base font-semibold text-[#52635B]"
            >
              আমাদের সম্পর্কে
            </a>
            <div className="mt-2 pt-3 border-t border-[#E7E2D8] flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#0B3B2C] font-bangla font-bold text-white">
                  চলো, পড়া শুরু করি!
                  <ArrowRight className="ml-1.5 h-4 w-4 text-[#FF5C35]" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

