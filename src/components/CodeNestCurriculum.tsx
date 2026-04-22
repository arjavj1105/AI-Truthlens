"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { BookOpen, GraduationCap, Laptop, Rocket, Zap } from "lucide-react";
import CodeNestHeader from "./CodeNestHeader";

const curriculumModules = [
  {
    title: "Hallucination Detection",
    tag: "Core",
    description: "Learn to identify and mitigate factual inconsistencies in large language model outputs.",
    icon: <Zap className="w-6 h-6 text-[#5ed29c]" />,
    duration: "4 Weeks",
    difficulty: "Beginner",
  },
  {
    title: "Model Bias Analysis",
    tag: "Essential",
    description: "Evaluate how different training datasets influence model neutrality and social impact.",
    icon: <Laptop className="w-6 h-6 text-[#5ed29c]" />,
    duration: "6 Weeks",
    difficulty: "Intermediate",
  },
  {
    title: "Reasoning Evaluation",
    tag: "Advanced",
    description: "Deep dive into multi-step reasoning chains and logical consistency across frontier models.",
    icon: <Rocket className="w-6 h-6 text-[#5ed29c]" />,
    duration: "8 Weeks",
    difficulty: "Advanced",
  },
  {
    title: "Reliability Prompting",
    tag: "Pro",
    description: "Advanced techniques to extract verifiable and high-fidelity responses from AI systems.",
    icon: <BookOpen className="w-6 h-6 text-[#5ed29c]" />,
    duration: "5 Weeks",
    difficulty: "Intermediate",
  },
];

const CodeNestCurriculum: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const hlsUrl = "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.error("Video play failed", e));
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#070b0a] overflow-hidden text-white font-sans pb-20">
      {/* Background & Layout */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-30"
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b0a] via-[#070b0a]/60 to-[#070b0a]" />
        
        {/* Grid System */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute left-1/4 top-0 h-full w-[1px] bg-white/5" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/5" />
          <div className="absolute left-3/4 top-0 h-full w-[1px] bg-white/5" />
        </div>

        {/* Subtle Glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 600 300">
            <ellipse cx="300" cy="150" rx="250" ry="100" fill="url(#glowGradient)" filter="url(#blurGlow)" />
            <defs>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#065f46" />
              </radialGradient>
              <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <CodeNestHeader />

      <main className="relative z-10 pt-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <span className="font-plus-jakarta font-bold text-[11px] tracking-widest text-[#5ed29c] uppercase flex items-center gap-2">
              <GraduationCap size={16} />
              Educational Path
            </span>
            <h1 className="text-4xl md:text-6xl font-inter font-extrabold tracking-tight uppercase">
              Learning <br /> <span className="text-[#5ed29c]">Reliability.</span>
            </h1>
          </div>
          <p className="text-white/60 max-w-md font-inter text-sm md:text-base">
            Our curriculum is designed by industry experts to bridge the gap between academic knowledge and real-world engineering challenges.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {curriculumModules.map((module, idx) => (
            <div 
              key={idx}
              className="relative group p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:translate-y-[-4px]"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Highlight Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5ed29c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    {module.icon}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase py-1 px-3 rounded-full bg-[#5ed29c]/10 text-[#5ed29c] border border-[#5ed29c]/20">
                    {module.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#5ed29c] transition-colors">{module.title}</h3>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  {module.description}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Duration</span>
                    <span className="text-sm font-medium">{module.duration}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Difficulty</span>
                    <span className="text-sm font-medium">{module.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CodeNestCurriculum;
