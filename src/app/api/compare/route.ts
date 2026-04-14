import { NextRequest, NextResponse } from "next/server";
import { compareModels } from "@/lib/modelService";
import { addRecord } from "@/lib/jsonService";
import { ComparePayload, ComparisonRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const payload: ComparePayload = await req.json();

    if (!payload.question || !payload.models || payload.models.length < 2) {
      return NextResponse.json(
        { error: "Please provide a question and select at least 2 models." },
        { status: 400 }
      );
    }

    // Call models concurrently
    const responses = await compareModels(payload.question, payload.models);

    // Save to history
    const record: ComparisonRecord = {
      id: crypto.randomUUID(),
      question: payload.question,
      selectedModels: payload.models,
      responses,
      createdAt: new Date().toISOString()
    };

    await addRecord(record);

    return NextResponse.json({ success: true, record }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
