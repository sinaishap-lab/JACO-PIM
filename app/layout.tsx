import type { Metadata } from "next";
import { Rubik, Heebo } from "next/font/google";
import "./globals.css";

/* Display face — rounded & heavy, matches the JACO PRINT brand headlines */
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

/* Body face — clean, highly legible Hebrew */
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "JACO PIM — מערכת ניהול מוצרים",
  description:
    "מערכת ניהול מידע מוצרים (PIM) של JACO PRINT — מהירה, מקומית, פשוטה.",
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
      className={`${rubik.variable} ${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-muted text-foreground">
        {children}
      </body>
    </html>
  );
}
