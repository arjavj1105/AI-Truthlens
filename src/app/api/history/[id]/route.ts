import { NextRequest, NextResponse } from "next/server";
import { getRecordById } from "@/lib/jsonService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const record = await getRecordById(id);
    
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, record }, { status: 200 });
  } catch (error: unknown) {
    console.error("Fetch record error:", error);
    return NextResponse.json(
      { error: "Failed to fetch record." },
      { status: 500 }
    );
  }
}
