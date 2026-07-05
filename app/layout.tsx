import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATE ME Daily Syllabus Planner",
  description: "Date-wise GATE Mechanical Engineering syllabus planner from July 6, 2026"
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
