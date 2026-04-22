"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ComparisonRecord } from "@/lib/types";
import { ResponseCard } from "@/components/ResponseCard";
import { ModelRanking } from "@/components/ModelRanking";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      } catch {
        setError("Failed to fetch record details.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest animate-pulse">
          Loading Query Record...
        </span>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-2xl mx-auto mt-16 px-6">
        <div className="glass-card border-red-500/20 p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-red-400 uppercase tracking-widest mb-1">RECORD_NOT_FOUND</div>
            <p className="text-gray-400 text-sm">{error || "Record not found"}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors border border-white/5 px-4 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-3 h-3" /> Return to Mission Control
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-12 space-y-12 pb-24"
    >
      {/* Back nav */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-mono text-gray-600 hover:text-gray-300 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" /> Mission Control
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pl-4 border-l-2 border-primary/40">
        <div>
          <div className="text-[9px] font-mono text-primary uppercase tracking-[0.25em] mb-1">
            Historical Record
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">
            Archived Analysis
          </h1>
        </div>
        <div className="flex items-center gap-6 font-mono text-[9px] text-gray-600">
          <div>
            <div className="uppercase tracking-widest mb-0.5">QUERY_ID</div>
            <div className="text-gray-400">{record.id.slice(0, 12)}...</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <div className="uppercase tracking-widest mb-0.5">RECORDED</div>
            <div className="text-gray-400">{new Date(record.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="glass-card border-white/5 px-6 py-5">
        <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Input Prompt</div>
        <p className="text-gray-300 font-body text-sm italic leading-relaxed">
          &quot;{record.question}&quot;
        </p>
      </div>

      {/* Responses */}
      <div className={`grid gap-6 ${
        record.responses.length === 1 ? "grid-cols-1 max-w-2xl" :
        record.responses.length === 2 ? "grid-cols-1 lg:grid-cols-2" :
        "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      }`}>
        {record.responses.map((response, idx) => (
          <ResponseCard key={idx} response={response} />
        ))}
      </div>

      {/* Analytics */}
      <ModelRanking responses={record.responses} />
    </motion.div>
  );
}
