import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATE ME Planner",
  description: "Excel-style GATE Mechanical Engineering daywise planner"
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
