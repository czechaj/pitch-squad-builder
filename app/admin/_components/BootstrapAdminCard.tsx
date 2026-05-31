"use client";

type Props = {
  bootstrapPhone: string;
  info: string;
  onChangePhone: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function BootstrapAdminCard({ bootstrapPhone, info, onChangePhone, onSubmit, onBack }: Props) {
  return (
    <section className="card stack">
      <h2>Ilk Admini Kaydet</h2>
      <input value={bootstrapPhone} onChange={(e) => onChangePhone(e.target.value)} placeholder="05XXXXXXXXX" />
      <button onClick={onSubmit}>Admin Hesabini Olustur</button>
      <div className="muted">{info}</div>
      <button onClick={onBack}>Geri Don</button>
    </section>
  );
}
