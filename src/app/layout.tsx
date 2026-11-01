import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Workflow Board",
  description: "Manage your team's tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
