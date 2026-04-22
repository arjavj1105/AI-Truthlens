"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CodeNestHeader from "./CodeNestHeader";

const CodeNestHero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

      <CodeNestHeader />

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

            <span className="text-[14px] opacity-60 mb-2 font-mono">[ 2026 ]</span>
            <h3 className="text-[18px] font-medium leading-tight mb-3">
              Multi-Model AI <span className="font-instrument-serif italic">Comparison</span>
            </h3>
            <p className="text-[11px] opacity-50 max-w-[140px]">
              Explore how different AI models respond to the same question and understand their behavior.
            </p>
          </div>
        </div>

        {/* 3. Hero Content & Typography */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <span className="font-plus-jakarta font-bold text-[11px] tracking-widest text-[#5ed29c] uppercase">
            AI Reliability Learning Platform
          </span>
          
          <h1 className="text-4xl md:text-7xl font-inter font-extrabold tracking-tight uppercase leading-[1.1]">
            COMPARE AI ANSWERS. <br className="hidden md:block" /> FIND THE TRUTH
            <span className="text-[#5ed29c]">.</span>
          </h1>

          <p className="text-sm md:text-base text-white/70 max-w-[512px] mx-auto font-inter">
            Analyze responses from multiple AI models side-by-side. Identify differences, understand inconsistencies, and improve how you use AI.
          </p>

          <div className="flex flex-col items-center gap-4 mt-8">
            <Link 
              href="/codenest/playground"
              className="bg-[#5ed29c] text-[#070b0a] font-bold py-4 px-8 rounded-full inline-flex items-center gap-3 uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-200"
            >
              Start Comparing
              <ArrowRight size={20} />
            </Link>
            <p className="text-xs text-white/40 font-inter tracking-wide italic">
              "No more blind trust — verify AI responses yourself."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeNestHero;
