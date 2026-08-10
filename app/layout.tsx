import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { UndoToast } from "@/components/UndoToast";
import { GlobalAuthGuard } from "@/components/GlobalAuthGuard";
import { ScrollReset } from "@/components/ScrollReset";

export const metadata: Metadata = {
  title: "PCG",
  description: "Smart duty roster, inventory, and finance tracker for MS of PCG.",
  applicationName: "PCG",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    title: "PCG",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon?v=2",
    apple: "/apple-icon?v=2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0C0D0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans flex flex-col h-screen overflow-hidden bg-[#0C0D0E] relative text-white/90">
        <GlobalAuthGuard>
          <ScrollReset />
          <TopNav />
          <main id="main-scroll-container" className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
          <UndoToast />
        </GlobalAuthGuard>
      </body>
    </html>
  );
}
