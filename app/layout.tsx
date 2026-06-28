import type { Metadata } from "next";
import { Rubik, Heebo, Geist_Mono } from "next/font/google";
import "./globals.css";

/* Brand fonts — Rubik (display, rounded/heavy) + Heebo (body), both Hebrew. */
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JACO-PIM — ניהול מידע על מוצרים",
  description: "מערכת לניהול מידע על מוצרים (Product Information Management)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${heebo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
