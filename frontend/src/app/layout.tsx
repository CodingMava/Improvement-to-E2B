import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sandbox Uptime Monitor",
  description: "Real-time E2B Sandbox Telemetry and Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col hidden md:flex">
            <h1 className="text-xl font-bold text-white mb-8">E2B Monitor</h1>
            <nav className="space-y-4 text-slate-400">
              <a href="/" className="block hover:text-white transition-colors">Dashboard</a>
              <a href="/sandboxes" className="block hover:text-white transition-colors">Sandboxes</a>
              <a href="/alerts" className="block hover:text-white transition-colors">Alerts</a>
            </nav>
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}