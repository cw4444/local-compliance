import type { Metadata } from "next";
import "./globals.css";
import { Banner } from "@/components/Banner";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Local Compliance — UK small-biz HR & ops helper",
  description:
    "Local-only, browser-side tools for UK small businesses: holiday entitlement, absence checks, onboarding, data retention, risk log.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen flex flex-col font-sans">
        <Banner />
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-baseline gap-3">
            <h1 className="font-semibold text-lg">Local Compliance</h1>
            <span className="text-xs text-slate-500">UK small-business HR &amp; ops helper · runs in your browser</span>
          </div>
        </header>
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-[200px_1fr] gap-6">
          <aside><Sidebar /></aside>
          <main className="min-w-0">{children}</main>
        </div>
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500">
            Not legal advice. Defaults are starting points — UK statutory rules change; double-check before relying on anything here.
          </div>
        </footer>
      </body>
    </html>
  );
}
