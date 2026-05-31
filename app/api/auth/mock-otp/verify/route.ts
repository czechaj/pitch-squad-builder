import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/mock-store";

const payloadSchema = z.object({
  phone: z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin"),
  code: z.string().trim().regex(/^\d{6}$/, "Kod 6 haneli olmali"),
});

export async function POST(req: Request) {
  try {
    const body = payloadSchema.parse(await req.json());
    const user = await verifyOtp(body.phone, body.code);
    return NextResponse.json({ ok: true, userId: user.id, role: user.role, phoneE164: user.phoneE164 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "OTP_VERIFY_FAILED", error: error instanceof Error ? error.message : "Islem basarisiz" }, { status: 400 });
  }
}
