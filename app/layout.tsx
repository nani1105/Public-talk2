import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Public Talk",
  description: "Modern news agency with daily e-paper and protected publishing portal"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
