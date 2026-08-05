"use client";

import { useAppStore } from "@/store";
import { Camera, Settings, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { BoardingFeeTracker } from "@/components/BoardingFeeTracker";
import { ConfirmModal } from "@/components/ConfirmModal";
import { IconMapper } from "@/components/IconMapper";
import { CldUploadWidget } from 'next-cloudinary';

export default function SettingsPage() {
  const { 
    users, currentUserRole, toggleUserRole, updateUserAvatar, addUser, removeUser, updateUser,
    rosterConfig, updateRosterConfig,
    inventoryItems, inventoryCycles, forceNextCycle, revertPreviousCycle, adminEditProgress, addInventoryItem, removeInventoryItem, updateItemQuota,
    resetAllData
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'profiles' | 'roster' | 'inventory' | 'fees' | 'danger'>('profiles');
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
    addUser({ name: newUserName.trim(), avatar: `https://api.dicebear.com/8.x/notionists/svg?seed=${newUserName}`, isActive: true });
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

  if (currentUserRole !== 'admin') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500 pb-10 pt-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You must be an admin to view this page.</p>
        <button onClick={toggleUserRole} className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-purple-500/30">
          Switch to Admin Mode (Dev Override)
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Manage global application settings, configurations, and users.</p>
        </div>
        <button 
          onClick={toggleUserRole}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 bg-purple-600 text-white shadow-purple-500/30"
        >
          Admin Mode Active
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2a2d36]">
        <button onClick={() => setActiveTab('profiles')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'profiles' ? 'bg-[#181a1f] border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5'}`}>User Profiles</button>
        <button onClick={() => setActiveTab('roster')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'roster' ? 'bg-[#181a1f] border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5'}`}>Roster Config</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'inventory' ? 'bg-[#181a1f] border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5'}`}>Inventory Config</button>
        <button onClick={() => setActiveTab('fees')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'fees' ? 'bg-[#181a1f] border-x border-t border-[#2a2d36] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-emerald-400' : 'text-gray-400 hover:bg-white/5'}`}>Boarding Fees</button>
        <button onClick={() => setActiveTab('danger')} className={`px-5 py-2.5 rounded-t-xl font-bold transition-colors ${activeTab === 'danger' ? 'bg-[#ff5a5a]/10 border-x border-t border-[#ff5a5a]/30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] text-[#ff5a5a]' : 'text-red-400 hover:bg-red-500/5'}`}>Danger Zone</button>
      </div>

      <div className="w-full">
        
        {/* PROFILES TAB */}
        {activeTab === 'profiles' && (
          <div className="bg-[#181a1f] rounded-b-3xl rounded-tr-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col gap-8 animate-in fade-in">
            <div className="flex flex-col gap-2">
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
                <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${user.isActive ? 'bg-black/20 border-[#2a2d36]' : 'bg-[#23252b]/50 border-dashed border-[#2a2d36] opacity-75'}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#1C1E22] shadow-sm bg-[#23252b] group shrink-0">
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{user.isActive ? 'Active' : 'Deactivated'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default'}
                      onSuccess={(result: any) => {
                        updateUserAvatar(user.id, result.info.secure_url);
                      }}
                    >
                      {({ open }) => (
                        <button 
                          onClick={(e) => { e.preventDefault(); open(); }}
                          className="cursor-pointer bg-[#23252b] border border-[#2a2d36] hover:bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      )}
                    </CldUploadWidget>
                    <button 
                      onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${user.isActive ? 'bg-[#ff5a5a]/10 text-red-400 border-[#ff5a5a]/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button 
                      onClick={() => openConfirm('Delete Boarder?', `Are you sure you want to completely remove ${user.name}? This cannot be undone.`, () => {
                        removeUser(user.id);
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                      })} 
                      className="p-1.5 text-[#ff5a5a] hover:bg-[#ff5a5a]/10 rounded-lg transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <div className="bg-[#181a1f] rounded-b-3xl rounded-tr-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col gap-8 animate-in fade-in">
             <div className="flex flex-col gap-2">
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
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="bg-[#181a1f] rounded-b-3xl rounded-tr-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col gap-8 animate-in fade-in">
             <div className="flex flex-col gap-2">
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
                    autoFocus
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
                const cycleInfo = inventoryCycles[item.id] || { currentCycle: 1, userProgress: {}, userDebts: {} };
                return (
                  <div key={item.id} className="flex flex-col gap-4 p-6 rounded-2xl border border-[#2a2d36] bg-black/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconMapper iconStr={item.icon || item.id} className="w-6 h-6 text-emerald-400" />
                        <div>
                          <h4 className="font-extrabold text-md text-white">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-gray-500">Cycle {cycleInfo.currentCycle} | Quota:</span>
                            {editingQuotaId === item.id ? (
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={editingQuotaValue}
                                  onChange={e => setEditingQuotaValue(parseInt(e.target.value) || 0)}
                                  className="w-16 p-1 text-xs border border-[#2a2d36] rounded bg-[#23252b] text-white"
                                  autoFocus
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
                        const p = cycleInfo.userProgress[user.id] || 0;
                        const d = cycleInfo.userDebts[user.id] || 0;
                        return (
                          <div key={user.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl border ${user.isActive ? 'border-[#2a2d36] bg-[#181a1f]' : 'border-dashed border-[#2a2d36] opacity-50'} gap-2`}>
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
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <div className="bg-[#181a1f] rounded-b-3xl rounded-tr-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col gap-8 animate-in fade-in">
             <div className="flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-white">Manage Boarding Fees</h3>
              <p className="text-sm text-gray-400">Admin override for boarding fees. You can manually check or uncheck payments for any user here.</p>
            </div>
            <div className="max-w-4xl">
              <BoardingFeeTracker isReadOnly={false} />
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <div className="bg-red-950/20 rounded-b-3xl rounded-tr-3xl p-6 md:p-8 border border-[#ff5a5a]/20 shadow-md flex flex-col gap-8 animate-in fade-in">
             <div className="flex flex-col gap-2">
              <h3 className="font-extrabold text-xl tracking-tight text-[#ff5a5a]">Danger Zone</h3>
              <p className="text-sm text-red-400/80 font-medium">Critical system operations. Ensure you export a backup before performing a factory reset.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
              <div className="flex-1 bg-[#181a1f] p-5 rounded-2xl border border-[#2a2d36] flex flex-col gap-3">
                <h4 className="font-bold text-white">Export Backup</h4>
                <p className="text-xs text-gray-400">Download the entire database state as a JSON file.</p>
                <button onClick={handleExport} className="mt-auto w-full bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-emerald-400 transition-colors">
                  Download .json
                </button>
              </div>

              <div className="flex-1 bg-[#181a1f] p-5 rounded-2xl border border-[#ff5a5a]/30 flex flex-col gap-3">
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
          </div>
        )}

      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title={confirmModal.title} 
        description={confirmModal.description} 
        onConfirm={confirmModal.action} 
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}
