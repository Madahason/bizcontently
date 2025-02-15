import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Bizcontently",
  description: "A modern full-stack application with AI capabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
