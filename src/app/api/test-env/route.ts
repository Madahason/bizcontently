import { NextResponse } from "next/server";

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    hasKey: !!anthropicKey,
    keyStart: anthropicKey ? anthropicKey.substring(0, 7) : null,
    keyLength: anthropicKey ? anthropicKey.length : 0,
  });
}
