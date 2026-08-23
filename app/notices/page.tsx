"use client";

import { PageHeader } from "@/components/PageHeader";
import { useAppStore } from "@/store";
import { useNoticeStore, Notice } from "@/store/noticeStore";
import { TodoWidget } from "@/components/TodoWidget";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle2, Pin, CalendarDays, X } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default function NoticesPage() {
  const { users, currentUserId } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  
  const { notices, addNotice, deleteNotice, markNoticeDone } = useNoticeStore();
  
  const [activeTab, setActiveTab] = useState<'common' | 'personal'>('common');
  const [mainTab, setMainTab] = useState<'notices' | 'todos'>('notices');
  const [isAdding, setIsAdding] = useState(false);
  
  const fetchNotices = useNoticeStore(state => state.fetchNotices);
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'hostel' as 'academic' | 'hostel' | 'emergency' | 'personal',
    date: ''
  });

  const filteredNotices = useMemo(() => {
    return notices
      .filter(n => {
        if (activeTab === 'personal') return n.type === 'personal';
        return n.type !== 'personal';
      })
      .filter(n => {
        if (activeTab === 'personal') {
          return n.createdBy === currentUserId || n.createdBy === 'me';
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notices, activeTab, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    addNotice({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: formData.date || undefined,
      createdBy: currentUser.id,
      isDone: false
    });
    
    setFormData({ title: '', description: '', type: 'hostel', date: '' });
    setIsAdding(false);
  };

  const canDelete = (notice: Notice) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return true;
    return notice.createdBy === currentUser.id;
  };

  if (!currentUser) return null;

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <PageHeader
        title="Notice Board"
        icon={Pin}
        description="Stay updated with room announcements and your personal pinned notes."
        actionButton={
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Notice</span>
          </button>
        }
      />

      <div className="flex gap-2 p-1 bg-black/20 rounded-lg w-fit mb-6">
        <button
          onClick={() => setMainTab('notices')}
          className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-300 ${mainTab === 'notices' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          Notices
        </button>
        <button
          onClick={() => setMainTab('todos')}
          className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-300 ${mainTab === 'todos' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          To-Do List
        </button>
      </div>

      {mainTab === 'notices' ? (
        <>
          <div className="flex bg-black/40 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner mb-2">
        <button
          onClick={() => setActiveTab('common')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'common' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          Common Board
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'personal' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          My Notes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2d36] rounded-[32px] bg-black/20"
            >
              <Pin className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium text-lg">No notices pinned here.</p>
            </motion.div>
          ) : (
            filteredNotices.map((notice) => {
              const isEmergency = notice.type === 'emergency';
              const isEvent = notice.type === 'academic';
              const creator = users.find(u => u.id === notice.createdBy);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  key={notice.id}
                  className={`relative p-6 rounded-3xl border backdrop-blur-xl shadow-2xl flex flex-col gap-4 group transition-all duration-300 ${
                    isEmergency 
                      ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50' 
                      : notice.isDone 
                        ? 'bg-black/40 border-white/5 opacity-50 hover:opacity-100' 
                        : 'bg-[#141618]/80 border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  {isEmergency && (
                    <>
                      <div className="absolute inset-0 rounded-3xl pointer-events-none animate-pulse ring-1 ring-red-500/50 bg-red-500/5"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-bl-full -mr-4 -mt-4 blur-[3rem] pointer-events-none"></div>
                    </>
                  )}

                  <div className="flex justify-between items-start z-10 relative">
                    <div className="flex items-center gap-2">
                      {isEmergency && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {isEvent && <Calendar className="w-5 h-5 text-blue-400" />}
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${
                        isEmergency ? 'bg-red-500/20 text-red-400' : isEvent ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-300'
                      }`}>
                        {notice.type === 'academic' ? 'ACADEMIC DEADLINE' : notice.type === 'hostel' ? 'GENERAL / HOSTEL' : (notice.type || 'UNKNOWN').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTab === 'personal' && (
                        <button 
                          onClick={() => markNoticeDone(notice.id, !notice.isDone)}
                          className={`p-1.5 rounded-lg transition-colors ${notice.isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {(activeTab === 'personal' || canDelete(notice)) && (
                        <button 
                          onClick={() => deleteNotice(notice.id)}
                          className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="z-10 relative">
                    <h3 className={`text-xl font-semibold ${isEmergency ? 'text-red-100' : 'text-white'} ${notice.isDone ? 'line-through text-gray-500' : ''}`}>
                      {notice.title}
                    </h3>
                    <p className={`mt-2 text-sm ${isEmergency ? 'text-red-200/70' : 'text-gray-400'} ${notice.isDone ? 'line-through' : ''}`}>
                      {notice.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 z-10 relative">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <span>{creator?.name || notice.createdBy}</span>
                      <span>•</span>
                      <span>{format(new Date(notice.createdAt), 'MMM dd')}</span>
                    </div>
                    {notice.date && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {notice.date}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      </>
      ) : (
        <TodoWidget />
      )}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141618]/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 border border-[#2a2d36] max-w-lg w-full animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsAdding(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#23252b] hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <h3 className="font-extrabold text-2xl tracking-tight text-white">Create Notice</h3>
              <p className="text-gray-400 text-sm mb-2">Pin a new announcement or personal note.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                  <input 
                    type="text" 
                    placeholder="Notice title..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Details about the notice..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Notice Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as 'academic' | 'hostel' | 'emergency' | 'personal'})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium appearance-none cursor-pointer focus:border-emerald-500/50 focus:outline-none transition-colors"
                  >
                    <option value="hostel">General/Hostel</option>
                    <option value="academic">Academic Deadline</option>
                    <option value="emergency">Emergency</option>
                    <option value="personal">Personal Note</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#23252b] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors">
                  Pin Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
