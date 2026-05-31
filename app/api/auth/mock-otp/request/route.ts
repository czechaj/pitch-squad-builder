import { NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/mock-store";

const payloadSchema = z.object({
  phone: z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin"),
});

export async function POST(req: Request) {
  try {
    const body = payloadSchema.parse(await req.json());
    const data = await requestOtp(body.phone);
    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "OTP_REQUEST_FAILED", error: error instanceof Error ? error.message : "Islem basarisiz" }, { status: 400 });
  }
}
