import { env } from "@/lib/env";

const MAX_BODY_BYTES = 16 * 1024;

export async function readJsonWithLimit<T>(req: Request, maxBytes = MAX_BODY_BYTES): Promise<T> {
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const text = await req.text();
  if (text.length > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  return JSON.parse(text || "{}");
}

export function logApiRequest(req: Request, route: string): void {
  const method = req.method;
  const ua = req.headers.get("user-agent") || "unknown";
  console.info(`[api] ${method} ${route} ua=${ua.slice(0, 80)}`);
}

export function sanitizeError(error: unknown, fallback = "Islem basarisiz"): string {
  if (error instanceof Error) {
    if (error.message === "REQUEST_TOO_LARGE") return "Istek boyutu cok buyuk";
    if (env.isProd) return fallback;
    return error.message || fallback;
  }

  return fallback;
}
