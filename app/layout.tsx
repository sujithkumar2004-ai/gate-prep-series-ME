import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATE ME Daily Syllabus Planner",
  description: "GATE Mechanical Engineering planner with syllabus completion by December 31 and exam day on February 7"
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
