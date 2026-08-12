"use client";

import { useAppStore } from "@/store";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import dynamic from "next/dynamic";

const SaaSAuthModal = dynamic(() => import("./SaaSAuthModal").then(mod => mod.SaaSAuthModal), { ssr: false });
const PersonalProfileModal = dynamic(() => import("./PersonalProfileModal").then(mod => mod.PersonalProfileModal), { ssr: false });

export function GlobalAuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useAppStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

  // If unauthenticated but on /admin, let the /admin page handle its own login
  if (!currentUserId && pathname !== '/admin') {
    return (
      <div className="w-full min-h-screen bg-[#090A0C] flex flex-col relative overflow-hidden">
        {/* Public Landing Page Header */}
        <header className="w-full px-6 py-6 md:px-12 flex justify-between items-center z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Image src="/bodimalogo.png" alt="Bodima Logo" width={120} height={40} className="invert opacity-90 object-contain" />
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-semibold text-white shadow-sm hover:shadow-white/5"
          >
            <User size={16} /> Sign In
          </motion.button>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[8rem] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[8rem] pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Smart living for <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">modern roommates.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mt-2">
              PG Connect seamlessly manages your household rosters, shared expenses, grocery inventory, and academic timetables all in one beautifully unified workspace.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-2xl shadow-xl hover:bg-gray-100 transition-colors text-lg"
            >
              Access Dashboard
            </motion.button>
          </motion.div>
        </div>

        <SaaSAuthModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <>
      {children}
      <PersonalProfileModal />
    </>
  );
}
