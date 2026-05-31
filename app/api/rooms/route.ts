import { NextResponse } from "next/server";
import { z } from "zod";
import { createRoom } from "@/lib/mock-store";

const phoneSchema = z.string().trim().regex(/^(\+90|0)?5\d{9}$/, "Gecerli telefon girin");

const payloadSchema = z.object({
  adminUserId: z.string().trim().min(1, "adminUserId zorunlu"),
  name: z.string().trim().min(2, "Oda adi en az 2 karakter olmali"),
  invitedPhones: z.array(phoneSchema).default([]),
});

export async function POST(req: Request) {
  try {
    const body = payloadSchema.parse(await req.json());
    return NextResponse.json({ ok: true, ...(await createRoom(body.adminUserId, body.name, body.invitedPhones)) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR", error: error.issues[0]?.message || "Gecersiz istek" }, { status: 422 });
    }

    return NextResponse.json({ ok: false, code: "ROOM_CREATE_FAILED", error: error instanceof Error ? error.message : "Islem basarisiz" }, { status: 400 });
  }
}
