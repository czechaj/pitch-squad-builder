"use client";

type Props = {
  adminPhone: string;
  adminOtpCode: string;
  info: string;
  onChangePhone: (value: string) => void;
  onChangeCode: (value: string) => void;
  onRequestCode: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function AdminLoginCard({
  adminPhone,
  adminOtpCode,
  info,
  onChangePhone,
  onChangeCode,
  onRequestCode,
  onSubmit,
  onBack,
}: Props) {
  return (
    <section className="card stack">
      <h2>Admin Girisi</h2>
      <div className="row">
        <input value={adminPhone} onChange={(e) => onChangePhone(e.target.value)} placeholder="05XXXXXXXXX" />
        <button onClick={onRequestCode}>Kod Iste</button>
      </div>
      <div className="row">
        <input value={adminOtpCode} onChange={(e) => onChangeCode(e.target.value)} placeholder="6 haneli kod" />
        <button onClick={onSubmit}>Girisi Tamamla</button>
      </div>
      <div className="muted">{info}</div>
      <button onClick={onBack}>Geri Don</button>
    </section>
  );
}
