import { NextResponse } from "next/server";
import { getHistory } from "@/lib/jsonService";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error: unknown) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history." },
      { status: 500 }
    );
  }
}
