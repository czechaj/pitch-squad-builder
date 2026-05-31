import { NextResponse } from "next/server";
import { z } from "zod";
import { joinByRef } from "@/lib/mock-store";
import { logApiRequest, readJsonWithLimit, sanitizeError } from "@/lib/api-guard";

const payloadSchema = z.object({
  refCode: z.string().trim().min(4, "Ref code en az 4 karakter olmali"),
  userId: z.string().trim().min(1, "userId zorunlu"),
  phone: z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin"),
});

export async function POST(req: Request) {
  try {
    logApiRequest(req, "/api/rooms/join-by-ref");
    const body = payloadSchema.parse(await readJsonWithLimit(req));
    return NextResponse.json({ ok: true, ...(await joinByRef(body.refCode, body.userId, body.phone)) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "ROOM_JOIN_FAILED", error: sanitizeError(error) }, { status: 400 });
  }
}
