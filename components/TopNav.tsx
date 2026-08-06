"use client";

import { Bell, Shield, User, Brush, Droplets, Bath, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store";
import { useState, useMemo, useRef, useEffect } from "react";
import { addWeeks } from "date-fns";
import { generateDeterministicSchedule } from "@/utils/rosterAlgorithm";

const links = [
  { name: "Dashboard", href: "/" },
  { name: "Roster", href: "/roster" },
  { name: "Inventory", href: "/inventory" },
  { name: "Academics", href: "/academics" },
  { name: "Finance", href: "/finance" },
  { name: "Settings", href: "/settings" }
];

import { useMagnetic } from "@/hooks/useMagnetic";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

function MagneticLink({ link, isActive }: { link: typeof links[0], isActive: boolean }) {
  const ref = useMagnetic<HTMLAnchorElement>();
  
  return (
    <Link
      ref={ref}
      href={link.href}
      className={`px-5 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300 ease-out ${
        isActive 
          ? 'bg-white/[0.12] text-white shadow-inner' 
          : 'text-white/50 hover:text-white/80'
      }`}
    >
      {link.name}
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const { users, currentUserId, setCurrentUserId, currentUserRole, toggleUserRole, rosterConfig, completedTasksHistory, upcomingSwaps } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const upcomingTasks = useMemo(() => {
    if (!currentUser) return [];
    const nextWeekDate = addWeeks(new Date(), 1);
    const schedule = generateDeterministicSchedule(nextWeekDate, users, rosterConfig, completedTasksHistory, upcomingSwaps || []);
    
    const tasks: any[] = [];
    schedule.forEach(day => {
      day.tasks.forEach(task => {
        if (task.assigneeIds.includes(currentUser.id)) {
          tasks.push({ day: day.dayName, ...task });
        }
      });
    });
    return tasks;
  }, [currentUser, rosterConfig, users, completedTasksHistory, upcomingSwaps]);

  return (
    <>
      <motion.header 
      initial={false}
      animate={{
        width: isScrolled ? "auto" : "100%",
        minWidth: isScrolled ? "200px" : "auto",
        y: isScrolled ? 0 : 0,
        backgroundColor: isScrolled ? "rgba(11, 12, 14, 0.9)" : "transparent",
        backdropFilter: isScrolled ? "blur(24px)" : "blur(0px)",
        border: isScrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
        boxShadow: isScrolled ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "none",
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-4 md:mx-8 mt-4 mb-4 px-6 flex items-center justify-between z-50 ${isScrolled ? 'fixed top-4 left-1/2 -translate-x-1/2 rounded-full h-14' : 'sticky top-4 h-16 rounded-full'}`}
    >
      {/* Left: Logo */}
      <motion.div 
        layout
        className="flex items-center"
      >
        <Image src="/pcglogo.png" alt="PCG Logo" width={isScrolled ? 60 : 80} height={isScrolled ? 22 : 30} className="invert opacity-90 object-contain transition-all duration-500" />
      </motion.div>

      {/* Center: Navigation Links */}
      <motion.nav layout className={`hidden md:flex items-center gap-2 ${isScrolled ? 'mx-4' : ''}`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return <MagneticLink key={link.name} link={link} isActive={isActive} />;
        })}
      </motion.nav>

      {/* Right: User Controls (Desktop) */}
      <motion.div layout className="hidden md:flex items-center gap-6">
        {/* User Switcher */}
        {!isScrolled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-[#2a2d36]">
            <select 
              value={currentUserId} 
              onChange={e => setCurrentUserId(e.target.value)}
              className="bg-[#23252b] border border-[#2a2d36] rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Admin Mode Toggle */}
        <button 
          onClick={toggleUserRole}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${currentUserRole === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#23252b] text-gray-400 border-[#2a2d36]'}`}
          title="Toggle Admin Role"
        >
          {currentUserRole === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          {!isScrolled && <span>{currentUserRole === 'admin' ? 'Admin' : 'Member'}</span>}
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" />
            {upcomingTasks.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </button>

          {/* Desktop Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-[#2a2d36]/50">
                <h3 className="font-sans font-bold text-white text-sm">Upcoming Duties</h3>
              </div>
              <div className="flex flex-col max-h-80 overflow-y-auto">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task, idx) => (
                    <div key={`${task.id}-${idx}`} className="flex items-center gap-4 p-4 border-b border-[#2a2d36]/50 last:border-0 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="bg-[#121415] p-2 rounded-xl border border-[#2a2d36] shrink-0">
                        {task.type === 'sweep' ? <Brush size={16} className="text-[#00ff9d]" /> : task.type === 'mop' ? <Droplets size={16} className="text-[#00ff9d]" /> : <Bath size={16} className="text-[#00ff9d]" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{task.title}</span>
                        <span className="text-xs text-emerald-400 font-semibold">{task.day}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400 font-mono text-sm">No upcoming duties for the next week.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2 text-gray-400 hover:text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </motion.header>

    {/* Mobile Full Screen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[70px] bottom-0 z-[999] bg-[#090A0C]/95 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto md:hidden border-t border-white/10 shadow-2xl"
          >
            <nav className="flex flex-col gap-4 mb-10">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-light py-4 border-b border-[#2a2d36] transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-6">
            {/* Mobile Notifications (In-line expansion) */}
            {showNotifications && (
              <div className="bg-[#1A1C1E] border border-[#2a2d36] rounded-2xl flex flex-col overflow-hidden animate-in fade-in">
                <div className="p-3 border-b border-[#2a2d36]">
                  <h3 className="font-sans font-bold text-white text-sm">Notifications</h3>
                </div>
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task, idx) => (
                      <div key={`${task.id}-${idx}`} className="flex items-center gap-3 p-3 border-b border-[#2a2d36]/50 last:border-0">
                        <div className="bg-[#121415] p-1.5 rounded-lg border border-[#2a2d36] shrink-0">
                          {task.type === 'sweep' ? <Brush size={14} className="text-[#00ff9d]" /> : task.type === 'mop' ? <Droplets size={14} className="text-[#00ff9d]" /> : <Bath size={14} className="text-[#00ff9d]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{task.title} on {task.day}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-400 font-mono text-xs">No upcoming duties.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Switcher */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-gray-500">Switch User</label>
              <select 
                value={currentUserId} 
                onChange={e => setCurrentUserId(e.target.value)}
                className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={toggleUserRole}
              className={`w-full flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-bold px-4 py-3 rounded-xl border transition-colors ${currentUserRole === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#23252b] text-gray-400 border-[#2a2d36]'}`}
            >
              {currentUserRole === 'admin' ? <><Shield className="w-4 h-4" /> Admin Mode Active</> : <><User className="w-4 h-4" /> Switch to Admin</>}
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
