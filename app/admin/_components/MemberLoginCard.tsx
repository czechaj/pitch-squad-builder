"use client";

type Props = {
  memberPhone: string;
  memberOtpCode: string;
  info: string;
  onChangePhone: (value: string) => void;
  onChangeCode: (value: string) => void;
  onRequestCode: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function MemberLoginCard({
  memberPhone,
  memberOtpCode,
  info,
  onChangePhone,
  onChangeCode,
  onRequestCode,
  onSubmit,
  onBack,
}: Props) {
  return (
    <section className="card stack">
      <h2>Davetli Girisi</h2>
      <div className="row">
        <input value={memberPhone} onChange={(e) => onChangePhone(e.target.value)} placeholder="05XXXXXXXXX" />
        <button onClick={onRequestCode}>Kod Iste</button>
      </div>
      <div className="row">
        <input value={memberOtpCode} onChange={(e) => onChangeCode(e.target.value)} placeholder="6 haneli kod" />
        <button onClick={onSubmit}>Giris Yap</button>
      </div>
      <div className="muted">{info}</div>
      <button onClick={onBack}>Geri Don</button>
    </section>
  );
}
