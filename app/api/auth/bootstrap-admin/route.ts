import { NextResponse } from "next/server";
import { z } from "zod";
import { bootstrapAdmin } from "@/lib/mock-store";
import { takeRateLimit } from "@/lib/rate-limit";

const payloadSchema = z.object({
  phone: z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin"),
});

export async function POST(req: Request) {
  try {
    const body = payloadSchema.parse(await req.json());
    const limited = takeRateLimit(`admin:bootstrap:${body.phone}`, 3, 10 * 60_000);
    if (!limited.ok) {
      return NextResponse.json({ ok: false, code: "RATE_LIMITED", error: `Too many attempts. Retry in ${limited.retryAfterSec}s` }, { status: 429 });
    }

    const user = await bootstrapAdmin(body.phone);
    return NextResponse.json({ ok: true, userId: user.id, role: user.role, phoneE164: user.phoneE164 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "BOOTSTRAP_FAILED", error: error instanceof Error ? error.message : "Islem basarisiz" }, { status: 403 });
  }
}
