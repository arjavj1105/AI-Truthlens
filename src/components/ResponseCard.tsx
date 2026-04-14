import { ModelResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface ResponseCardProps {
  response: ModelResponse;
}

export function ResponseCard({ response }: ResponseCardProps) {
  const isError = response.status === "error";

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b flex items-center justify-between",
        isError ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
      )}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
            {response.model}
          </span>
          {isError ? (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Success
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
          <Clock className="w-3 h-3" />
          {response.latencyMs}ms
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 prose prose-sm dark:prose-invert max-w-none">
        {isError ? (
          <div className="text-red-500 dark:text-red-400 text-sm py-2">
            <strong>Failed to generate response:</strong>
            <p className="mt-1 font-mono text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/50">
              {response.error}
            </p>
          </div>
        ) : (
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
            {response.answer}
          </div>
        )}
      </div>

    </div>
  );
}
