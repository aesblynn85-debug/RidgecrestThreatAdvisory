import type { Metadata } from "next";
import "./globals.css";

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || "R.A.V.E.N. Intelligence";

export const metadata: Metadata = {
  title: `${orgName} — OSINT Case Platform`,
  description:
    "Case-centric OSINT intake, entity resolution, link analysis, and client-ready assessments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
