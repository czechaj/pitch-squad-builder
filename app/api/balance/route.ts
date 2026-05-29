import { NextResponse } from "next/server";
import { calculateBalance } from "@/lib/balance";

export async function POST(request: Request) {
  const body = await request.json();
  const result = calculateBalance(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, details: result.details }, { status: 400 });
  }
  return NextResponse.json({ teams: result.teams, players: result.players });
}
