import { NextResponse } from "next/server";
import { calculateBalance } from "@/lib/balance";
import { logApiRequest, readJsonWithLimit, sanitizeError } from "@/lib/api-guard";

export async function POST(request: Request) {
  try {
    logApiRequest(request, "/api/balance");
    const body = await readJsonWithLimit(request);
    const result = calculateBalance(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: 400 });
    }
    return NextResponse.json({ teams: result.teams, players: result.players });
  } catch (error: unknown) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 400 });
  }
}
