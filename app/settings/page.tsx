"use client";

import { useAppStore } from "@/store";
import { Camera, Settings, Upload } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BoardingFeeTracker } from "@/components/BoardingFeeTracker";
import { ConfirmModal } from "@/components/ConfirmModal";
import { IconMapper } from "@/components/IconMapper";
import { UserProfileModal } from "@/components/UserProfileModal";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { 
    users, currentUserId, isAdminAuthenticated, logoutAdmin, updateUserAvatar, addUser, removeUser, updateUser,
    rosterConfig, updateRosterConfig,
    inventoryItems, inventoryCycles, forceNextCycle, revertPreviousCycle, adminEditProgress, addInventoryItem, removeInventoryItem, updateItemQuota,
    resetAllData,
    courses, holidays, timetableConfig, addCourse, removeCourse, addHoliday, removeHoliday, updateTimetableConfig
  } = useAppStore();
  
  const router = useRouter();
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const [activeTab, setActiveTab] = useState<'profiles' | 'roster' | 'inventory' | 'fees' | 'timetable' | 'danger'>('timetable');
  const [activeUserModal, setActiveUserModal] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuota, setNewItemQuota] = useState(1000);
  const [newItemUnit, setNewItemUnit] = useState('g');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
  const [editingQuotaValue, setEditingQuotaValue] = useState<number>(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    action: () => {}
  });

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    creditHours: 2,
    sessions: []
  });

  const [newHoliday, setNewHoliday] = useState({
    title: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    isLongVacation: false
  });

  const openConfirm = (title: string, description: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, description, action });
  };

  const handleFileUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      updateUserAvatar(userId, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const stateStr = localStorage.getItem('ms-of-pcg-storage');
    if (!stateStr) return;
    const blob = new Blob([stateStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boarding-house-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    addUser({ name: newUserName.trim(), avatar: `https://api.dicebear.com/8.x/notionists/svg?seed=${newUserName}`, isActive: true, role: 'member' });
    setNewUserName('');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addInventoryItem({
      name: newItemName.trim(),
      quota: newItemQuota,
      unit: newItemUnit.trim() || 'g',
      icon: 'Package',
      color: 'text-emerald-400'
    });
    setNewItemName('');
    setNewItemQuota(1000);
    setNewItemUnit('g');
    setIsCustomUnit(false);
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    const current = rosterConfig.activeDays;
    if (current.includes(day)) {
      updateRosterConfig({ activeDays: current.filter(d => d !== day) });
    } else {
      updateRosterConfig({ activeDays: [...current, day] });
    }
  };

  useEffect(() => {
    if (currentUser?.name?.toLowerCase() !== 'manusha') {
      router.push('/');
    }
  }, [currentUser?.name, router]);

  if (currentUser?.name?.toLowerCase() !== 'manusha') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500 pb-10 pt-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Access Denied</h1>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    );
  }

  console.log("Current Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Manage global application settings, configurations, and users.</p>
        </div>
        <button 
          onClick={logoutAdmin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 bg-red-500/10 text-red-400 border border-red-500/20"
        >
          Logout Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2a2d36]">
        <button onClick={() => setActiveTab('profiles')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'profiles' ? 'bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5 whitespace-nowrap'}`}>User Profiles</button>
        <button onClick={() => setActiveTab('roster')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'roster' ? 'bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5 whitespace-nowrap'}`}>Roster Config</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'inventory' ? 'bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5 whitespace-nowrap'}`}>Inventory Config</button>
        <button onClick={() => setActiveTab('fees')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'fees' ? 'bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5 whitespace-nowrap'}`}>Boarding Fees</button>
        <button onClick={() => setActiveTab('timetable')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'timetable' ? 'bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5 whitespace-nowrap'}`}>Timetable Setup</button>
        <button onClick={() => setActiveTab('danger')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'danger' ? 'bg-[#ff5a5a]/10 border-x border-t border-[#ff5a5a]/30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-[#ff5a5a]' : 'text-red-400 hover:bg-red-500/5 whitespace-nowrap'}`}>Danger Zone</button>
      </div>

      <div className="w-full">
        
        {/* PROFILES TAB */}
        {/* PROFILES TAB */}
        {activeTab === 'profiles' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Manage Boarders</h3>
              <p className="text-sm text-gray-400">Add new roommates or deactivate existing ones. Deactivated users are removed from rosters but their history remains.</p>
            </div>

            <form onSubmit={handleAddUser} className="flex gap-3 items-end p-4 bg-black/20 rounded-2xl border border-[#2a2d36]">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">New Boarder Name</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Enter name..."
                  className="p-2.5 rounded-xl border border-[#2a2d36] bg-[#23252b] text-white shadow-sm"
                  required
                />
              </div>
              <button type="submit" className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors">
                Add Boarder
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => setActiveUserModal(user.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-all duration-300 ${user.isActive ? 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05]' : 'bg-[#1A1D20]/50 border-dashed border-white/[0.02] opacity-50'}`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/[0.1] bg-[#141618] shrink-0">
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-white/90">{user.name}</span>
                    <span className="text-xs text-white/40">{user.isActive ? 'Active Member' : 'Deactivated'}</span>
                  </div>
                  {user.role === 'admin' && (
                    <div className="px-2 py-1 rounded-md bg-[#00ff9d]/10 text-[#00ff9d] text-[10px] font-medium tracking-wide uppercase">
                      Admin
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'roster' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Roster Configuration</h3>
              <p className="text-sm text-gray-400">Adjust which days the roster runs, and how many people are assigned to each task per day.</p>
            </div>

            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-white">Active Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => {
                    const isActive = rosterConfig.activeDays.includes(day);
                    return (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isActive ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#23252b]/50 text-gray-400 border-transparent hover:border-[#2a2d36] hover:text-white'}`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <h4 className="font-extrabold text-lg text-white mt-2">Task Configuration</h4>
                <p className="text-sm text-gray-400 font-medium mb-4">Configure frequencies and headcounts for boarding duties.</p>
                <div className="flex flex-col gap-4">
                  {(rosterConfig.tasks || [
                    { id: 'sweep', name: 'Sweep the floor', frequency: 'daily', assigneesPerOccurrence: 2 },
                    { id: 'mop', name: 'Mop the floor', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 2 },
                    { id: 'toilet', name: 'Clean Toilet', frequency: 'weekly', occurrencesPerWeek: 1, assigneesPerOccurrence: 1 }
                  ] as any[]).map((task, idx) => (
                    <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-[#2a2d36] bg-[#121415] gap-4 shadow-sm transition-colors hover:border-gray-700">
                      <div className="flex flex-col w-40">
                        <span className="font-mono uppercase tracking-widest text-white text-[10px]">{task.name}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-0.5">{task.id}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Frequency</label>
                          <select 
                            value={task.frequency}
                            onChange={(e) => {
                              const newTasks = [...(rosterConfig.tasks || [])];
                              if (!newTasks[idx]) newTasks[idx] = task;
                              newTasks[idx] = { ...newTasks[idx], frequency: e.target.value as 'daily' | 'weekly' };
                              if (e.target.value === 'weekly' && !newTasks[idx].occurrencesPerWeek) {
                                newTasks[idx].occurrencesPerWeek = 1;
                              }
                              updateRosterConfig({ tasks: newTasks });
                            }}
                            className="p-2 h-[38px] rounded-lg border border-[#2a2d36] bg-[#121415] text-white text-[10px] uppercase tracking-widest font-bold shadow-sm focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all cursor-pointer"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>

                        {task.frequency === 'weekly' && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Times / Week</label>
                            <div className="flex items-center">
                              <button onClick={() => {
                                const newTasks = [...(rosterConfig.tasks || [])];
                                if (!newTasks[idx]) newTasks[idx] = task;
                                newTasks[idx] = { ...newTasks[idx], occurrencesPerWeek: Math.max(1, (task.occurrencesPerWeek || 1) - 1) };
                                updateRosterConfig({ tasks: newTasks });
                              }} className="w-8 h-[38px] rounded-l-lg bg-[#121415] border border-[#2a2d36] text-gray-400 flex items-center justify-center font-mono hover:text-[#00ff9d] hover:border-[#00ff9d] transition-colors">-</button>
                              <input type="number" value={task.occurrencesPerWeek || 1} readOnly className="w-12 h-[38px] border-y border-[#2a2d36] text-center font-mono text-sm bg-[#121415] text-white focus:outline-none" />
                              <button onClick={() => {
                                const newTasks = [...(rosterConfig.tasks || [])];
                                if (!newTasks[idx]) newTasks[idx] = task;
                                newTasks[idx] = { ...newTasks[idx], occurrencesPerWeek: (task.occurrencesPerWeek || 1) + 1 };
                                updateRosterConfig({ tasks: newTasks });
                              }} className="w-8 h-[38px] rounded-r-lg bg-[#121415] border border-[#2a2d36] text-gray-400 flex items-center justify-center font-mono hover:text-[#00ff9d] hover:border-[#00ff9d] transition-colors">+</button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">People Needed</label>
                          <div className="flex items-center">
                            <button onClick={() => {
                              const newTasks = [...(rosterConfig.tasks || [])];
                              if (!newTasks[idx]) newTasks[idx] = task;
                              newTasks[idx] = { ...newTasks[idx], assigneesPerOccurrence: Math.max(0, task.assigneesPerOccurrence - 1) };
                              updateRosterConfig({ tasks: newTasks });
                            }} className="w-8 h-[38px] rounded-l-lg bg-[#121415] border border-[#2a2d36] text-gray-400 flex items-center justify-center font-mono hover:text-[#00ff9d] hover:border-[#00ff9d] transition-colors">-</button>
                            <input type="number" value={task.assigneesPerOccurrence} readOnly className="w-12 h-[38px] border-y border-[#2a2d36] text-center font-mono text-sm bg-[#121415] text-white focus:outline-none" />
                            <button onClick={() => {
                              const newTasks = [...(rosterConfig.tasks || [])];
                              if (!newTasks[idx]) newTasks[idx] = task;
                              newTasks[idx] = { ...newTasks[idx], assigneesPerOccurrence: task.assigneesPerOccurrence + 1 };
                              updateRosterConfig({ tasks: newTasks });
                            }} className="w-8 h-[38px] rounded-r-lg bg-[#121415] border border-[#2a2d36] text-gray-400 flex items-center justify-center font-mono hover:text-[#00ff9d] hover:border-[#00ff9d] transition-colors">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Inventory Configuration & Overrides</h3>
              <p className="text-sm text-gray-400">Add new items to track, force cycles to advance, or manually override debt and progress grams.</p>
            </div>

            <form onSubmit={handleAddItem} className="flex gap-3 items-end p-4 bg-black/20 rounded-2xl border border-[#2a2d36] max-w-2xl">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">New Item Name</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Tea Leaves"
                  className="p-2.5 rounded-xl border border-[#2a2d36] bg-[#23252b] text-white shadow-sm"
                  required
                />
              </div>
              <div className="w-24 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Quota</label>
                <input 
                  type="number" 
                  value={newItemQuota}
                  onChange={e => setNewItemQuota(parseInt(e.target.value) || 0)}
                  className="p-2.5 rounded-xl border border-[#2a2d36] bg-[#23252b] text-white shadow-sm"
                  required
                />
              </div>
              <div className="w-24 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                {isCustomUnit ? (
                  <input 
                    type="text" 
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    placeholder="e.g. boxes"
                    className="p-2.5 rounded-xl border border-[#2a2d36] bg-[#23252b] text-white shadow-sm"
                    required
                  />
                ) : (
                  <select 
                    value={newItemUnit}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomUnit(true);
                        setNewItemUnit('');
                      } else {
                        setNewItemUnit(e.target.value);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-[#2a2d36] bg-[#23252b] text-white shadow-sm"
                    required
                  >
                    <option value="g">g (Grams)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="ml">ml (Milliliters)</option>
                    <option value="L">L (Liters)</option>
                    <option value="cm">cm (Centimeters)</option>
                    <option value="qty">qty (Pieces)</option>
                    <option value="packs">packs (Packets)</option>
                    <option value="custom">Other...</option>
                  </select>
                )}
              </div>
              <button type="submit" className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors">
                Add Item
              </button>
            </form>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {inventoryItems.map(item => {
                const cycleInfo = inventoryCycles[item.id] || {};
                const userProgress = cycleInfo.userProgress || {};
                const userDebts = cycleInfo.userDebts || {};
                
                return (
                  <div key={item.id} className="flex flex-col gap-4 p-6 rounded-2xl border border-[#2a2d36] bg-black/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconMapper iconStr={item.icon || item.id} className="w-6 h-6 text-emerald-400" />
                        <div>
                          <h4 className="font-extrabold text-md text-white">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-gray-500">Cycle {cycleInfo.currentCycle || 1} | Quota:</span>
                            {editingQuotaId === item.id ? (
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={editingQuotaValue}
                                  onChange={e => setEditingQuotaValue(parseInt(e.target.value) || 0)}
                                  className="w-16 p-1 text-xs border border-[#2a2d36] rounded bg-[#23252b] text-white"
                                />
                                <span className="text-xs font-bold text-gray-400">{item.unit || 'g'}</span>
                                <button 
                                  onClick={() => { updateItemQuota(item.id, editingQuotaValue); setEditingQuotaId(null); }}
                                  className="ml-1 text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded shadow-sm hover:bg-emerald-400"
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingQuotaId(null)} className="text-[10px] text-gray-500 hover:text-white">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 group cursor-pointer" onClick={() => { setEditingQuotaId(item.id); setEditingQuotaValue(item.quota ?? 0); }}>
                                <span className="text-xs font-bold text-emerald-400">{item.quota ?? 0} {item.unit || 'g'}</span>
                                <Settings className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => revertPreviousCycle(item.id)} className="text-xs font-bold bg-[#23252b] hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg border border-[#2a2d36] transition-colors">Revert Cycle</button>
                        <button onClick={() => forceNextCycle(item.id)} className="text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors">Force Cycle</button>
                        <button 
                          onClick={() => openConfirm('Delete Category?', `Are you sure you want to completely remove ${item.name}? This will delete all tracking progress.`, () => {
                            removeInventoryItem(item.id);
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                          })} 
                          className="text-xs font-bold text-red-400 hover:bg-[#ff5a5a]/10 p-1.5 rounded-lg transition-colors"
                        >&times;</button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {users.map(user => {
                        const p = userProgress[user.id] || 0;
                        const d = userDebts[user.id] || 0;
                        return (
                          <div key={user.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl border ${user.isActive ? 'border-[#2a2d36] bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl' : 'border-dashed border-[#2a2d36] opacity-50'} gap-2`}>
                            <span className="font-bold text-xs min-w-[80px] text-white">{user.name}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Prog:</label>
                                <input type="number" value={p} onChange={(e) => adminEditProgress(item.id, user.id, parseInt(e.target.value) || 0, d)} className="w-14 p-1 text-xs border border-[#2a2d36] rounded bg-[#23252b] text-white" />
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase text-red-400">Debt:</label>
                                <input type="number" value={d} onChange={(e) => adminEditProgress(item.id, user.id, p, parseInt(e.target.value) || 0)} className="w-14 p-1 text-xs border border-[#2a2d36] rounded bg-[#23252b] text-red-400 font-bold" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Manage Boarding Fees</h3>
              <p className="text-sm text-gray-400">Admin override for boarding fees. You can manually check or uncheck payments for any user here.</p>
            </div>
            <div className="relative z-10 max-w-4xl">
              <BoardingFeeTracker isReadOnly={false} />
            </div>
          </motion.div>
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Timetable Setup</h3>
              <p className="text-sm text-gray-400">Manage the university semester dates, lecture timetable, and vacations.</p>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              {/* Validity Period */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                <h3 className="font-bold text-white text-lg mb-4">Semester Validity Period</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Starts On</label>
                    <input 
                      type="date" 
                      value={timetableConfig?.validFrom || ''}
                      onChange={e => updateTimetableConfig({ validFrom: e.target.value })}
                      className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Ends On</label>
                    <input 
                      type="date" 
                      value={timetableConfig?.validTo || ''}
                      onChange={e => updateTimetableConfig({ validTo: e.target.value })}
                      className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Manager */}
                <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">Course Manager</h3>
                    <p className="text-sm text-gray-400">Add recurring weekly lectures or lab sessions.</p>
                  </div>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCourse.name) return;
                      addCourse(newCourse as any);
                      setNewCourse({ code: '', name: '', creditHours: 2, sessions: [] });
                    }}
                    className="flex flex-col gap-4 bg-[#090A0C]/50 p-4 rounded-2xl border border-white/5"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Course Code</label>
                      <input 
                        type="text"
                        placeholder="e.g. CMIS 2113"
                        value={newCourse.code}
                        onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                        className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Subject Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Data Structures"
                        value={newCourse.name}
                        onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                        className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Credits</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={newCourse.creditHours}
                        onChange={e => setNewCourse({ ...newCourse, creditHours: parseInt(e.target.value) || 0 })}
                        className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                      />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 py-2 rounded-xl font-bold transition-colors mt-2">
                      Add Course Placeholder
                    </button>
                    <p className="text-xs text-gray-500 text-center">Sessions can currently only be configured via the raw JSON dump.</p>
                  </form>

                  <div className="flex flex-col gap-4 mt-2">
                    <h4 className="text-sm font-bold text-gray-400 border-b border-[#2a2d36] pb-1">All Courses</h4>
                    <div className="flex flex-col gap-2">
                      {courses.map(course => (
                        <div key={course.id} className="flex flex-col bg-[#090A0C]/50 p-3 rounded-xl border border-[#2a2d36]">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{course.code} - {course.name}</span>
                              <span className="text-xs text-gray-500">{course.creditHours} Credits • {course.sessions?.length || 0} Sessions</span>
                            </div>
                            <button onClick={() => removeCourse(course.id)} className="text-red-400 hover:text-red-300 p-1">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Holiday Manager */}
                <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">Holiday Management</h3>
                    <p className="text-sm text-gray-400">Define off-days and vacations.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newHoliday.title) return;
                      addHoliday(newHoliday);
                      setNewHoliday(prev => ({ ...prev, title: '' }));
                    }}
                    className="flex flex-col gap-4 bg-[#090A0C]/50 p-4 rounded-2xl border border-white/5"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-bold uppercase">Holiday Title</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Poya Day"
                        value={newHoliday.title}
                        onChange={e => setNewHoliday({ ...newHoliday, title: e.target.value })}
                        className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-bold uppercase">Start Date</label>
                        <input 
                          required
                          type="date"
                          value={newHoliday.startDate}
                          onChange={e => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
                          className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-bold uppercase">End Date</label>
                        <input 
                          required
                          type="date"
                          value={newHoliday.endDate}
                          onChange={e => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                          className="bg-[#141618] border border-[#2a2d36] rounded-xl px-4 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input 
                        type="checkbox"
                        checked={newHoliday.isLongVacation}
                        onChange={e => setNewHoliday({ ...newHoliday, isLongVacation: e.target.checked })}
                        className="w-4 h-4 rounded border-[#2a2d36] bg-[#141618] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span className="text-sm font-medium text-gray-300">This is a Long Vacation</span>
                    </label>
                    <button type="submit" className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 py-2 rounded-xl font-bold transition-colors mt-2">
                      Add Holiday
                    </button>
                  </form>

                  <div className="flex flex-col gap-2 mt-2">
                    {holidays.sort((a, b) => a.startDate.localeCompare(b.startDate)).map(holiday => (
                      <div key={holiday.id} className="flex items-center justify-between bg-[#090A0C]/50 p-3 rounded-xl border border-[#2a2d36]">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{holiday.title}</span>
                            {holiday.isLongVacation && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Long Vacation</span>}
                          </div>
                          <span className="text-xs text-gray-500">
                            {holiday.startDate === holiday.endDate ? holiday.startDate : `${holiday.startDate} to ${holiday.endDate}`}
                          </span>
                        </div>
                        <button onClick={() => removeHoliday(holiday.id)} className="text-red-400 hover:text-red-300 p-1">✕</button>
                      </div>
                    ))}
                    {holidays.length === 0 && <p className="text-sm text-gray-500 text-center py-4 italic">No holidays defined.</p>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#0B0C0E] border border-[#ff5a5a]/20 shadow-2xl rounded-b-[32px] rounded-tr-[32px] p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
          >
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-red-500/15 to-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-[#ff5a5a]">Danger Zone</h3>
              <p className="text-sm text-red-400/80 font-medium">Critical system operations. Ensure you export a backup before performing a factory reset.</p>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-4 max-w-2xl">
              <div className="flex-1 bg-black/20 backdrop-blur-xl p-5 rounded-[24px] border border-[#2a2d36] flex flex-col gap-3">
                <h4 className="font-bold text-white">Export Backup</h4>
                <p className="text-xs text-gray-400">Download the entire database state as a JSON file.</p>
                <button onClick={handleExport} className="mt-auto w-full bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-emerald-400 transition-colors">
                  Download .json
                </button>
              </div>

              <div className="flex-1 bg-black/20 backdrop-blur-xl p-5 rounded-[24px] border border-[#ff5a5a]/30 flex flex-col gap-3">
                <h4 className="font-bold text-[#ff5a5a]">Factory Reset</h4>
                <p className="text-xs text-gray-400">Wipe all logs, tasks, and users. Resets to defaults.</p>
                <button 
                  onClick={() => openConfirm('Factory Reset?', 'This will wipe all data including users, tasks, and inventory logs. This action is catastrophic and permanent.', () => {
                    resetAllData();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  })} 
                  className="mt-auto w-full bg-[#ff5a5a] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-red-500 transition-colors"
                >
                  Reset System
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title={confirmModal.title} 
        description={confirmModal.description} 
        onConfirm={confirmModal.action} 
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
      />

      {activeUserModal && (
        <UserProfileModal 
          userId={activeUserModal}
          onClose={() => setActiveUserModal(null)}
        />
      )}
    </div>
  );
}
