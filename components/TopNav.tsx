"use client";

import { Bell, Menu, X, Check, Search, Calendar, Brush, Droplets, Bath, PartyPopper } from "lucide-react";
import dynamic from "next/dynamic";
const PersonalProfileModal = dynamic(() => import("./PersonalProfileModal").then(mod => mod.PersonalProfileModal), { ssr: false });
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store";
import { useState, useMemo, useRef, useEffect } from "react";
import { addWeeks, format } from "date-fns";
import { generateDeterministicSchedule } from "@/utils/rosterAlgorithm";

const links = [
  { name: "Dashboard", href: "/" },
  { name: "Roster", href: "/roster" },
  { name: "Inventory", href: "/inventory" },
  { name: "Academics", href: "/academics" },
  { name: "Finance", href: "/finance" },
  { name: "Notices", href: "/notices" },
  { name: "Settings", href: "/settings" },
  { name: "User", href: "/user" }
];

import { useMagnetic } from "@/hooks/useMagnetic";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

function MagneticLink({ link, isActive, onClick }: { link: typeof links[0], isActive: boolean, onClick: () => void }) {
  const ref = useMagnetic<HTMLAnchorElement>();
  
  return (
    <Link
      ref={ref}
      href={link.href}
      scroll={false}
      onClick={onClick}
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
  const { 
    users = [], 
    currentUserId, 
    setCurrentUserId, 
    isAdminAuthenticated, 
    rosterConfig = { activeDays: [], tasks: [] }, 
    completedTasksHistory = [], 
    upcomingSwaps = [],
    setProfileModalOpen,
    rooms = [],
    logout
  } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const currentRoom = rooms.find(r => r.id === currentUser?.roomId) || rooms[0];
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
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
  }, [currentUser, users, rosterConfig, completedTasksHistory, upcomingSwaps]);

  if (pathname === '/admin') {
    return null;
  }

  const birthdayNotifications = useMemo(() => {
    const today = format(new Date(), 'MM-dd');
    return users.filter(u => u.birthday && format(new Date(u.birthday), 'MM-dd') === today);
  }, [users]);

  const totalNotifications = upcomingTasks.length + birthdayNotifications.length;

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
        className="flex items-center gap-3"
      >
        {currentRoom?.logoUrl ? (
          <Image src={currentRoom.logoUrl} alt={currentRoom.name} width={isScrolled ? 40 : 50} height={isScrolled ? 40 : 50} className="object-contain rounded-lg shadow-md" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black tracking-widest">
            {currentRoom?.name ? currentRoom.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'RT'}
          </div>
        )}
        <div className="flex flex-col hidden sm:flex">
          <span className="font-extrabold text-sm text-white tracking-tight leading-tight">{currentRoom?.name || 'My Room'}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{currentRoom?.faculty || 'Dashboard'}</span>
        </div>
      </motion.div>

      {/* Center: Navigation Links */}
      <motion.nav layout className={`hidden md:flex items-center gap-2 ${isScrolled ? 'mx-4' : ''}`}>
        {links.map((link) => {
          if (link.name === "User") return null;
          if (link.name === "Settings" && currentUser?.name?.toLowerCase() !== 'manusha') return null;
          const isActive = pathname === link.href;
          return <MagneticLink key={link.name} link={link} isActive={isActive} onClick={handleNavClick} />;
        })}
      </motion.nav>

      {/* Right: User Controls (Desktop) */}
      <motion.div layout className="hidden md:flex items-center gap-4 md:mr-6 lg:mr-10">

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-white/10 text-white' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </button>

          {/* Desktop Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-[#2a2d36]/50">
                <h3 className="font-sans font-bold text-white text-sm">Notifications</h3>
              </div>
              <div className="flex flex-col max-h-80 overflow-y-auto">
                {birthdayNotifications.length > 0 && (
                  birthdayNotifications.map(u => (
                    <div key={`bday-${u.id}`} className="flex items-center gap-4 p-4 border-b border-emerald-500/20 bg-emerald-500/5 last:border-0 hover:bg-emerald-500/10 transition-colors">
                      <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 shrink-0">
                        <PartyPopper size={16} className="text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Happy Birthday, {u.name}! 🎂</span>
                        <span className="text-xs text-emerald-400 font-semibold">Wish them a great day!</span>
                      </div>
                    </div>
                  ))
                )}
                
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
                  upcomingTasks.length === 0 && birthdayNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 font-mono text-sm">No new notifications.</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Picture & Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-emerald-500/50 transition-all shrink-0"
          >
            <Image src={currentUser?.avatar || '/default-avatar.png'} alt="Profile" fill className="object-cover" />
          </button>
          
          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div className="w-14 h-14 relative rounded-full overflow-hidden shrink-0 border border-white/20">
                      <Image src={currentUser?.avatar || '/default-avatar.png'} alt="Avatar" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-white font-bold text-lg leading-tight">{currentUser?.name}</h4>
                      <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">{currentUser?.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 text-sm text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Birthday</span>
                      <span className="text-white">{currentUser?.birthday || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email</span>
                      <span className="text-white">{currentUser?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Phone</span>
                      <span className="text-white">{currentUser?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-2 rounded-xl transition-colors border border-white/10"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2 rounded-xl transition-colors border border-red-500/20"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              if (link.name === "Settings" && currentUser?.name?.toLowerCase() !== 'manusha') return null;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  scroll={false}
                  onClick={() => {
                    handleNavClick();
                    setIsMobileMenuOpen(false);
                  }}
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

          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
