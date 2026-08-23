import { useState, useMemo, useEffect } from 'react';
import { useNoticeStore } from '@/store/noticeStore';
import { Calendar, Plus, Clock } from 'lucide-react';
import { AddDeadlineModal } from './AddDeadlineModal';
import { differenceInDays, parseISO, isPast } from 'date-fns';

export function UpcomingDeadlinesWidget() {
  const { notices, fetchNotices } = useNoticeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const academicNotices = useMemo(() => {
    return notices
      .filter(n => n.type === 'academic' && !n.isDone)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [notices]);

  const getCountdownText = (dateString?: string) => {
    if (!dateString) return 'No Date';
    const date = parseISO(dateString);
    if (isPast(date)) return 'Past Due';
    const days = differenceInDays(date, new Date());
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const getCountdownColor = (dateString?: string) => {
    if (!dateString) return 'text-gray-500';
    const date = parseISO(dateString);
    if (isPast(date)) return 'text-red-500';
    const days = differenceInDays(date, new Date());
    if (days <= 2) return 'text-red-400';
    if (days <= 7) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <>
      <div className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 relative overflow-hidden flex flex-col h-fit">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[3rem] pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-3">
          <h3 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Deadlines
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {academicNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#2a2d36] rounded-2xl bg-black/20">
              <Calendar className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-gray-400 text-sm font-medium">No upcoming deadlines.</p>
              <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            academicNotices.map(notice => (
              <div key={notice.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col gap-1 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-white">{notice.title}</h4>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 border border-white/5 ${getCountdownColor(notice.date)}`}>
                    {getCountdownText(notice.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{notice.description}</p>
                {notice.date && (
                  <div className="flex items-center gap-1.5 mt-2 text-[#00ff9d] text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" /> Due: {notice.date}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <AddDeadlineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
