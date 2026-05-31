"use client";

import type { InviteItem } from "./types";

type Props = {
  adminSessionInfo: string;
  roomName: string;
  invitedPhones: string;
  info: string;
  invites: InviteItem[];
  onChangeRoomName: (value: string) => void;
  onChangeInvitedPhones: (value: string) => void;
  onSubmit: () => void;
  onBackHome: () => void;
};

export function RoomCreateCard({
  adminSessionInfo,
  roomName,
  invitedPhones,
  info,
  invites,
  onChangeRoomName,
  onChangeInvitedPhones,
  onSubmit,
  onBackHome,
}: Props) {
  return (
    <section className="card stack">
      <h2>Admin Paneli</h2>
      <div className="muted">{adminSessionInfo}</div>
      <input value={roomName} onChange={(e) => onChangeRoomName(e.target.value)} placeholder="Oda adi" />
      <textarea value={invitedPhones} onChange={(e) => onChangeInvitedPhones(e.target.value)} rows={6} placeholder="Her satira bir telefon" />
      <button onClick={onSubmit}>Odayi Olustur</button>
      <div className="muted">{info}</div>
      <ul>{invites.map((invite) => <li key={invite.refCode}>{invite.phoneE164} - <b>{invite.refCode}</b></li>)}</ul>
      <button onClick={onBackHome}>Ana Menu</button>
    </section>
  );
}
