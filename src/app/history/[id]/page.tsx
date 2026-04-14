"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ComparisonRecord } from "@/lib/types";
import { ResponseCard } from "@/components/ResponseCard";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<ComparisonRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchRecord() {
      try {
        const res = await fetch(`/api/history/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setRecord(data.record);
        } else {
          setError(data.error || "Record not found");
        }
      } catch (err: any) {
        setError("Failed to fetch record details.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Failed to load comparison</h2>
        <p className="text-red-600 mb-6">{error || "Record not found"}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg border shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="pt-4 pb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to comparisons
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Historical Comparison
          </h1>
          <div className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
             {new Date(record.createdAt).toLocaleString()}
          </div>
        </div>
      </header>

      <section className="space-y-6 pt-4 animate-in fade-in duration-500">
        
        <div className="bg-gray-100 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner">
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider">Prompt</h3>
          <p className="text-gray-800 dark:text-gray-200 italic font-medium leading-relaxed">
            "{record.question}"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {record.responses.map((response, idx) => (
            <ResponseCard key={idx} response={response} />
          ))}
        </div>
        
      </section>
    </div>
  );
}
