import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitch Squad Builder",
  description: "FM tarzı puanlarla dengeli takım dağıtımı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
