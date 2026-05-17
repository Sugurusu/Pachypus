import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pachypus Portfolio Manager",
  description: "High-value pachypus inventory, sales, and profit manager."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
