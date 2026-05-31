const isProd = process.env.NODE_ENV === "production";

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const env = {
  isProd,
  isVercel: !!process.env.VERCEL,
  mockOtpEnabled: parseBool(process.env.ENABLE_MOCK_OTP, !isProd),
};

export function assertServerEnv() {
  if (!env.isProd) return;

  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");

  if (missing.length > 0) {
    throw new Error(`Missing required env vars in production: ${missing.join(", ")}`);
  }
}
