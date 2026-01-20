import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radial Menu Generator — Everforest",
  description: "BetterTouchTool radial menu HTML generator with Everforest Dark Hard theme",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ef-bg0 text-ef-fg antialiased">{children}</body>
    </html>
  );
}
