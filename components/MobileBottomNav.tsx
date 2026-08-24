"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Pin, MoreHorizontal, CalendarDays, Package, GraduationCap, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  
  const { currentUserId, users = [] } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  const primaryLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Finance", href: "/finance", icon: Wallet },
    { name: "Notices", href: "/notices", icon: Pin },
  ];

  const moreLinks = [
    { name: "Roster", href: "/roster", icon: CalendarDays },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Academics", href: "/academics", icon: GraduationCap },
  ];
  
  if (currentUser?.name?.toLowerCase() === 'manusha') {
     moreLinks.push({ name: "Settings", href: "/settings", icon: Settings });
  }

  // If on admin or login screens, hide nav
  if (pathname === '/admin') return null;
  if (!currentUser) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]" ref={moreMenuRef}>
      
      {/* More Menu Pop-up */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-2xl flex flex-col gap-1"
          >
            {moreLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    handleNavClick();
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span className="text-sm font-semibold">{link.name}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill (Bottom Bar) */}
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex gap-8 items-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        {primaryLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => {
                handleNavClick();
                setIsMoreOpen(false);
              }}
              className="flex flex-col items-center justify-center gap-1 w-10 h-10 relative group"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
              </div>
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]"
                />
              )}
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="flex flex-col items-center justify-center gap-1 w-10 h-10 relative group"
        >
          <div className={`transition-all duration-300 ${isMoreOpen ? 'text-white scale-110' : 'text-gray-500 group-hover:text-gray-300'}`}>
            <MoreHorizontal className="w-6 h-6" />
          </div>
        </button>
      </div>
    </div>
  );
}
