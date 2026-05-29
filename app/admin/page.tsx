"use client";
import Link from "next/link";
import { useState } from "react";

export default function AdminPage() {
  const [screen, setScreen] = useState("home");
  return <main><h1>Admin Akisi</h1><p><Link href="/">Ana Ekran</Link></p><section className="card"><p>Bu ekran Next.js'e tasindi.</p><div className="row"><button onClick={()=>setScreen("bootstrap")}>Ilk Admin</button><button onClick={()=>setScreen("admin-login")}>Admin Giris</button></div><p className="muted">Aktif ekran: {screen}</p></section></main>;
}
