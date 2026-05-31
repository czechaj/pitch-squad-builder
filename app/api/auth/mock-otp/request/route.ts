import { NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/mock-store";
import { env } from "@/lib/env";
import { takeRateLimit } from "@/lib/rate-limit";
import { logApiRequest, readJsonWithLimit, sanitizeError } from "@/lib/api-guard";

const payloadSchema = z.object({
  phone: z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin"),
});

export async function POST(req: Request) {
  try {
    logApiRequest(req, "/api/auth/mock-otp/request");
    if (!env.mockOtpEnabled) {
      return NextResponse.json({ ok: false, code: "FEATURE_DISABLED", error: "Mock OTP disabled" }, { status: 403 });
    }

    const body = payloadSchema.parse(await readJsonWithLimit(req));
    const limited = takeRateLimit(`otp:request:${body.phone}`, 5, 5 * 60_000);
    if (!limited.ok) {
      return NextResponse.json({ ok: false, code: "RATE_LIMITED", error: `Too many attempts. Retry in ${limited.retryAfterSec}s` }, { status: 429 });
    }

    const data = await requestOtp(body.phone);
    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "OTP_REQUEST_FAILED", error: sanitizeError(error) }, { status: 400 });
  }
}
