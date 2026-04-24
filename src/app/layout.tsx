import type { Metadata } from "next";
import "./globals.css";
import { HistorySidebar } from "@/components/HistorySidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI TruthLens | Mission Control for LLM Validation",
  description: "Advanced model comparison and hallucination detection playground.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-background-obsidian antialiased">
        <div className="relative min-h-screen flex flex-col">
          {/* Persistent Navigation Header */}
          <header className="sticky top-0 z-50 bg-background-obsidian/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-primary/20 border border-primary/40 rounded flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <span className="text-primary font-bold text-lg">T</span>
                </div>
                <span className="font-display font-bold text-xl tracking-tight">
                  AI <span className="text-primary">TRUTHLENS</span>
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
                <Link href="/" className="hover:text-primary transition-colors">Playground</Link>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Active</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <aside className="hidden lg:block w-80 border-r border-white/5 bg-black/20 overflow-y-auto">
              <HistorySidebar />
            </aside>
            <main className="flex-1 overflow-y-auto relative">
              {/* Background Accent Glow */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] accent-glow-bg rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] accent-glow-bg rounded-full opacity-10" />
              </div>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
