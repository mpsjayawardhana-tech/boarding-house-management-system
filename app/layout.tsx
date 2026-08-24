import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import dynamic from "next/dynamic";
import { GlobalAuthGuard } from "@/components/GlobalAuthGuard";
import { ScrollReset } from "@/components/ScrollReset";
import { HydrationGuard } from "@/components/HydrationGuard";

const UndoToast = dynamic(() => import("@/components/UndoToast").then(mod => mod.UndoToast), { ssr: false });
const ImpersonationBanner = dynamic(() => import("@/components/ImpersonationBanner").then(mod => mod.ImpersonationBanner), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav").then(mod => mod.MobileBottomNav), { ssr: false });

export const metadata: Metadata = {
  title: "Bodima",
  description: "Smart duty roster, inventory, and finance tracker for modern roommates.",
  applicationName: "Bodima",
  manifest: "/manifest.json?v=3",
  appleWebApp: {
    capable: true,
    title: "Bodima",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.png?v=3",
    apple: "/apple-touch-icon.png?v=3",
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
        <HydrationGuard>
          <GlobalAuthGuard>
            <ImpersonationBanner />
            <ScrollReset />
            <TopNav />
            
            <main id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth scrollbar-hide px-0 md:px-8 w-full">
              {children}
            </main>
            
            <MobileBottomNav />
            <UndoToast />
          </GlobalAuthGuard>
        </HydrationGuard>
      </body>
    </html>
  );
}
