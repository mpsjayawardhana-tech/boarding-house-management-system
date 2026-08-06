import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { UndoToast } from "@/components/UndoToast";

export const metadata: Metadata = {
  title: "MS of PCG | Boarding House Manager",
  description: "Smart duty roster, inventory, and finance tracker for MS of PCG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans flex flex-col h-screen overflow-hidden bg-[#0C0D0E] relative text-white/90">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <UndoToast />
      </body>
    </html>
  );
}
