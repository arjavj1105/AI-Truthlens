"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // Big Buck Bunny (placeholder)

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover opacity-20 scale-110"
        autoPlay
        muted
        loop
        playsInline
        style={{ filter: "grayscale(100%) brightness(0.5)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background-obsidian via-transparent to-background-obsidian opacity-80" />
    </div>
  );
}
