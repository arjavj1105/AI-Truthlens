"use client";

import { usePathname } from "next/navigation";
import { HistorySidebar } from "@/components/HistorySidebar";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname.startsWith("/codenest");

  return (
    <div className="flex h-screen overflow-hidden">
      {!isLandingPage && <HistorySidebar />}
      <main 
        className={cn(
          "flex-1 overflow-y-auto w-full mx-auto",
          isLandingPage ? "max-w-none p-0" : "max-w-7xl p-4 sm:p-6 lg:p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
