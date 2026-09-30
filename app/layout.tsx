import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-b" });
export const metadata: Metadata = { title: "PartyLyiN", description: "Timed video and voice calls that beat loneliness." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
