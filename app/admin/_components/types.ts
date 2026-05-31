export type Screen = "home" | "bootstrap" | "admin-login" | "admin-panel" | "member-login" | "member-join";

export type SessionUser = { userId: string; phoneE164: string; role: string };
export type InviteItem = { phoneE164: string; refCode: string };
