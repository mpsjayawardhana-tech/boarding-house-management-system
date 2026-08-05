"use client";

import { Bell, Shield, User, Brush, Droplets, Bath } from "lucide-react";
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
  { name: "Finance", href: "/finance" },
  { name: "Settings", href: "/settings" }
];

import { useMagnetic } from "@/hooks/useMagnetic";

function MagneticLink({ link, isActive }: { link: typeof links[0], isActive: boolean }) {
  const ref = useMagnetic<HTMLAnchorElement>();
  
  return (
    <Link
      ref={ref}
      href={link.href}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out ${
        isActive 
          ? 'bg-emerald-400/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="h-20 px-8 flex items-center justify-between border-b border-[#2a2d36] bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm w-full">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Image src="/pcglogo.png" alt="PCG Logo" width={80} height={30} className="invert opacity-90 object-contain" />
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return <MagneticLink key={link.name} link={link} isActive={isActive} />;
        })}
      </nav>

      {/* Right: User Controls */}
      <div className="flex items-center gap-6">
        
        {/* User Switcher (For Testing RBAC) */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-[#2a2d36]">
          <select 
            value={currentUserId} 
            onChange={e => setCurrentUserId(e.target.value)}
            className="bg-[#23252b] border border-[#2a2d36] rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button 
            onClick={toggleUserRole}
            className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1.5 rounded-lg border shadow-sm transition-colors ${currentUserRole === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-[#23252b] text-gray-400 border-[#2a2d36]'}`}
          >
            {currentUserRole === 'admin' ? <><Shield className="w-3 h-3" /> Admin</> : <><User className="w-3 h-3" /> User</>}
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white hidden md:block"
          >
            <Bell className="w-5 h-5" />
            {upcomingTasks.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0f1115]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-[#1A1C1E] border border-[#2a2d36] rounded-2xl shadow-2xl z-50 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-[#2a2d36]">
                <h3 className="font-sans font-bold text-white">Notifications</h3>
              </div>
              <div className="flex flex-col max-h-80 overflow-y-auto">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task, idx) => (
                    <div key={`${task.id}-${idx}`} className="flex items-center gap-3 p-4 border-b border-[#2a2d36]/50 hover:bg-white/5 transition-colors last:border-0">
                      <div className="bg-[#121415] p-2 rounded-lg border border-[#2a2d36] shrink-0">
                        {task.type === 'sweep' ? <Brush size={16} className="text-[#00ff9d]" /> : task.type === 'mop' ? <Droplets size={16} className="text-[#00ff9d]" /> : <Bath size={16} className="text-[#00ff9d]" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Upcoming Duty: {task.title} on {task.day}</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-1">Next Week</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 font-mono text-sm">No upcoming duties for next week. You are free!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2a2d36] bg-[#23252b] shadow-sm">
            {currentUser?.avatar && (
              <Image 
                src={currentUser.avatar} 
                alt={currentUser?.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
