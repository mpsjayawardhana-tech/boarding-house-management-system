import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { UndoToast } from "@/components/UndoToast";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-space-mono',
});

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
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans flex flex-col h-screen overflow-hidden bg-animated-gradient relative text-white`}>
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <UndoToast />
      </body>
    </html>
  );
}
