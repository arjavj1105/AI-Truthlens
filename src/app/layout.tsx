import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HistorySidebar } from "@/components/HistorySidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI TruthLens – Hallucination Detection & Validation Playground",
  description: "Multi-model comparison system for Hallucination Detection Validation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex h-screen overflow-hidden`}>
        <HistorySidebar />
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
