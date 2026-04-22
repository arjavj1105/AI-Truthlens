"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CodeNestHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/codenest" },
    { name: "Curriculum", href: "/codenest/curriculum" },
    { name: "Playground", href: "/codenest/playground" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
        <Link href="/codenest" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-[#070b0a] font-bold text-xl">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AI-Truthlens</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 font-inter text-base">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/70 hover:text-[#5ed29c] transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#070b0a]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        {navLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-3xl font-inter text-white hover:text-[#5ed29c]"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </>
  );
};

export default CodeNestHeader;
