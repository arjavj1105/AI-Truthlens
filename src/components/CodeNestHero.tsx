"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CodeNestHero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const hlsUrl = "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.error("Video play failed", e));
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
      }
    }
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#070b0a] overflow-hidden text-white font-sans">
      {/* 1. Background & Layout */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-60"
          muted
          loop
          playsInline
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent" />
        
        {/* Grid System */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute left-1/4 top-0 h-full w-[1px] bg-white/10" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/10" />
          <div className="absolute left-3/4 top-0 h-full w-[1px] bg-white/10" />
        </div>

        {/* Central Glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 600 300">
            <ellipse
              cx="300"
              cy="150"
              rx="250"
              ry="100"
              fill="url(#glowGradient)"
              filter="url(#blurGlow)"
            />
            <defs>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#065f46" />
              </radialGradient>
              <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* 4. Global Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-[#070b0a] font-bold text-xl">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight">AI-Truthlens</span>
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
            className="text-3xl font-inter hover:text-[#5ed29c]"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        
        {/* 2. The Liquid Glass Card */}
        <div className="relative group mb-8">
          <div 
            className="w-[200px] h-[200px] flex flex-col items-center justify-center p-6 text-center -translate-y-[50px] transition-transform duration-500 ease-out group-hover:-translate-y-[60px]"
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              backgroundBlendMode: "luminosity",
              backdropFilter: "blur(4px)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              position: "relative",
              borderRadius: "24px",
            }}
          >
            {/* Border Effect */}
            <div 
              className="absolute inset-0 p-[1.4px] rounded-[24px] pointer-events-none before:content-[''] before:absolute before:inset-0 before:p-[1.4px] before:rounded-[24px] before:bg-gradient-to-b before:from-white/40 before:to-transparent"
              style={{
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
              }}
            />

            <span className="text-[14px] opacity-60 mb-2 font-mono">[ 2025 ]</span>
            <h3 className="text-[18px] font-medium leading-tight mb-3">
              Taught by <span className="font-instrument-serif italic">Industry</span> Professionals
            </h3>
            <p className="text-[11px] opacity-50 max-w-[140px]">
              Learn from the experts who build the future.
            </p>
          </div>
        </div>

        {/* 3. Hero Content & Typography */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <span className="font-plus-jakarta font-bold text-[11px] tracking-widest text-[#5ed29c] uppercase">
            Career-Ready Curriculum
          </span>
          
          <h1 className="text-4xl md:text-7xl font-inter font-extrabold tracking-tight uppercase leading-[1.1]">
            LAUNCH YOUR CODING <br className="hidden md:block" /> CAREER
            <span className="text-[#5ed29c]">.</span>
          </h1>

          <p className="text-sm md:text-base text-white/70 max-w-[512px] mx-auto font-inter">
            Master in-demand coding skills through immersive, project-based learning. 
            Build a portfolio that stands out to top-tier tech companies globally.
          </p>

          <Link 
            href="/"
            className="mt-8 bg-[#5ed29c] text-[#070b0a] font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-200"
          >
            Get Started
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CodeNestHero;
