"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { postJson } from "@/app/shared/api";
import { AdminLoginCard } from "./_components/AdminLoginCard";
import { BootstrapAdminCard } from "./_components/BootstrapAdminCard";
import { MemberJoinCard } from "./_components/MemberJoinCard";
import { MemberLoginCard } from "./_components/MemberLoginCard";
import { RoomCreateCard } from "./_components/RoomCreateCard";
import type { InviteItem, Screen, SessionUser } from "./_components/types";

type BootstrapAdminResponse = { userId: string; phoneE164: string; role: string };
type OtpRequestResponse = { phoneE164: string; mockCode: string };
type OtpVerifyResponse = { userId: string; phoneE164: string; role: string };
type CreateRoomResponse = { roomId: string; invites: InviteItem[] };
type JoinRoomResponse = { roomId: string };

export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [admin, setAdmin] = useState<SessionUser>({ userId: "", phoneE164: "", role: "" });
  const [member, setMember] = useState<SessionUser>({ userId: "", phoneE164: "", role: "" });
  const [roomId, setRoomId] = useState("");
  const [info, setInfo] = useState<Record<string, string>>({});
  const [invites, setInvites] = useState<InviteItem[]>([]);

  const [bootstrapPhone, setBootstrapPhone] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminOtpCode, setAdminOtpCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [invitedPhones, setInvitedPhones] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberOtpCode, setMemberOtpCode] = useState("");
  const [joinRefCode, setJoinRefCode] = useState("");

  const setMsg = (key: string, msg: string) => setInfo((s) => ({ ...s, [key]: msg }));

  const adminSessionInfo = useMemo(() => {
    if (!admin.userId) return "Henuz admin girisi yapilmadi.";
    return `Admin girisi aktif: ${admin.phoneE164} (${admin.role})${roomId ? ` | Son roomId: ${roomId}` : ""}`;
  }, [admin, roomId]);

  return (
    <main>
      <h1>Admin Akisi</h1>
      <p><Link href="/">Ana Ekran</Link></p>

      {screen === "home" && (
        <section className="card stack">
          <button onClick={() => setScreen("bootstrap")}>Ilk Admin Hesabi Olustur</button>
          <button onClick={() => setScreen("admin-login")}>Admin Girisi</button>
          <button onClick={() => setScreen("member-login")}>Davetli Girisi</button>
        </section>
      )}

      {screen === "bootstrap" && (
        <BootstrapAdminCard
          bootstrapPhone={bootstrapPhone}
          info={info.bootstrap}
          onChangePhone={setBootstrapPhone}
          onBack={() => setScreen("home")}
          onSubmit={async () => {
            try {
              const data = await postJson<BootstrapAdminResponse>("/api/auth/bootstrap-admin", { phone: bootstrapPhone.trim() });
              setAdmin({ userId: data.userId, phoneE164: data.phoneE164, role: data.role });
              setMsg("bootstrap", `Admin kaydedildi: ${data.phoneE164}`);
              setScreen("admin-login");
            } catch (error: any) {
              setMsg("bootstrap", error.message);
            }
          }}
        />
      )}

      {screen === "admin-login" && (
        <AdminLoginCard
          adminPhone={adminPhone}
          adminOtpCode={adminOtpCode}
          info={info.adminLogin}
          onChangePhone={setAdminPhone}
          onChangeCode={setAdminOtpCode}
          onBack={() => setScreen("home")}
          onRequestCode={async () => {
            try {
              const data = await postJson<OtpRequestResponse>("/api/auth/mock-otp/request", { phone: adminPhone.trim() });
              setMsg("adminLogin", `Kod olusturuldu (mock): ${data.mockCode}`);
            } catch (error: any) {
              setMsg("adminLogin", error.message);
            }
          }}
          onSubmit={async () => {
            try {
              const data = await postJson<OtpVerifyResponse>("/api/auth/mock-otp/verify", { phone: adminPhone.trim(), code: adminOtpCode.trim() });
              if (data.role !== "ADMIN") throw new Error("Bu kullanici admin degil.");
              setAdmin({ userId: data.userId, phoneE164: data.phoneE164, role: data.role });
              setMsg("adminLogin", `Admin girisi basarili: ${data.phoneE164}`);
              setScreen("admin-panel");
            } catch (error: any) {
              setMsg("adminLogin", error.message);
            }
          }}
        />
      )}

      {screen === "admin-panel" && (
        <RoomCreateCard
          adminSessionInfo={adminSessionInfo}
          roomName={roomName}
          invitedPhones={invitedPhones}
          invites={invites}
          info={info.room}
          onChangeRoomName={setRoomName}
          onChangeInvitedPhones={setInvitedPhones}
          onBackHome={() => setScreen("home")}
          onSubmit={async () => {
            try {
              const data = await postJson<CreateRoomResponse>("/api/rooms", {
                adminUserId: admin.userId,
                name: roomName.trim(),
                invitedPhones: invitedPhones.split("\n").map((s) => s.trim()).filter(Boolean),
              });
              setRoomId(data.roomId);
              setInvites(data.invites || []);
              setMsg("room", `Oda olusturuldu: ${data.roomId}`);
            } catch (error: any) {
              setMsg("room", error.message);
            }
          }}
        />
      )}

      {screen === "member-login" && (
        <MemberLoginCard
          memberPhone={memberPhone}
          memberOtpCode={memberOtpCode}
          info={info.memberLogin}
          onChangePhone={setMemberPhone}
          onChangeCode={setMemberOtpCode}
          onBack={() => setScreen("home")}
          onRequestCode={async () => {
            try {
              const data = await postJson<OtpRequestResponse>("/api/auth/mock-otp/request", { phone: memberPhone.trim() });
              setMsg("memberLogin", `Kod olusturuldu (mock): ${data.mockCode}`);
            } catch (error: any) {
              setMsg("memberLogin", error.message);
            }
          }}
          onSubmit={async () => {
            try {
              const data = await postJson<OtpVerifyResponse>("/api/auth/mock-otp/verify", { phone: memberPhone.trim(), code: memberOtpCode.trim() });
              setMember({ userId: data.userId, phoneE164: data.phoneE164, role: data.role });
              setMsg("memberLogin", `Davetli girisi basarili: ${data.phoneE164}`);
              setScreen("member-join");
            } catch (error: any) {
              setMsg("memberLogin", error.message);
            }
          }}
        />
      )}

      {screen === "member-join" && (
        <MemberJoinCard
          joinRefCode={joinRefCode}
          info={info.join}
          onChangeRefCode={setJoinRefCode}
          onBack={() => setScreen("member-login")}
          onSubmit={async () => {
            try {
              const data = await postJson<JoinRoomResponse>("/api/rooms/join-by-ref", {
                refCode: joinRefCode.trim(),
                userId: member.userId,
                phone: memberPhone.trim(),
              });
              setRoomId(data.roomId);
              setMsg("join", `Katilim basarili. roomId: ${data.roomId}`);
            } catch (error: any) {
              setMsg("join", error.message);
            }
          }}
        />
      )}
    </main>
  );
}
