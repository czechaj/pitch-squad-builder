"use client";

type Props = {
  joinRefCode: string;
  info: string;
  onChangeRefCode: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function MemberJoinCard({ joinRefCode, info, onChangeRefCode, onSubmit, onBack }: Props) {
  return (
    <section className="card stack">
      <h2>Ref Code ile Odaya Katil</h2>
      <input value={joinRefCode} onChange={(e) => onChangeRefCode(e.target.value)} placeholder="REFCODE" />
      <button onClick={onSubmit}>Odaya Katil</button>
      <div className="muted">{info}</div>
      <button onClick={onBack}>Davetli Girisine Don</button>
    </section>
  );
}
