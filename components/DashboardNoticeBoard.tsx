import { useNoticeStore } from "@/store/noticeStore";
import { AlertTriangle, Calendar, Pin, ChevronRight, GripVertical } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useMemo } from "react";

interface DashboardNoticeBoardProps {
  isEditMode?: boolean;
}

export function DashboardNoticeBoard({ isEditMode }: DashboardNoticeBoardProps) {
  const { notices, fetchNotices } = useNoticeStore();

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const latestCommonNotices = useMemo(() => {
    return notices
      .filter(n => n.type !== 'personal')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [notices]);

  return (
    <div className="bg-[#0B0C0E] border-y md:border-x border-white/[0.08] rounded-none md:rounded-[32px] p-6 md:p-8 shadow-2xl relative flex flex-col hover:bg-[#1A1D20] hover:border-white/[0.15] transition-all duration-300 overflow-hidden min-h-[350px] h-full">
      {isEditMode && <div className="absolute top-4 left-4 z-20 p-2 bg-white/10 rounded-full cursor-grab active:cursor-grabbing text-white/50 hover:text-white transition-colors"><GripVertical className="w-5 h-5" /></div>}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00ff9d]/10 to-blue-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
      
      <div className="relative z-10 flex justify-between items-center mb-6 border-b border-[#2a2d36] pb-4">
        <h3 className={`text-[10px] uppercase tracking-widest font-extrabold text-white flex items-center gap-2 ${isEditMode ? 'ml-10' : ''}`}>
          <Pin className="w-4 h-4 text-[#00ff9d]" /> Notice Board
        </h3>
        <Link href="/notices" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#00ff9d] flex items-center gap-1 transition-colors">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
        {latestCommonNotices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2d36] rounded-2xl bg-black/20 p-6 opacity-60">
            <Pin className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm font-medium text-center">No common notices right now.</p>
          </div>
        ) : latestCommonNotices.map(notice => {
            const isEmergency = notice.type === 'emergency';
            const isAcademic = notice.type === 'academic';
            const isHostel = notice.type === 'hostel';
            
            return (
              <div key={notice.id} className="p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden group bg-[#141618]/60 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-2">
                  {isEmergency && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {isAcademic && <Calendar className="w-4 h-4 text-blue-400" />}
                  {isHostel && <Pin className="w-4 h-4 text-emerald-400" />}
                  <h4 className="text-sm font-semibold text-gray-200 truncate flex-1">
                    {notice.title}
                  </h4>
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-2">
                  {notice.description}
                </p>
              </div>
            )
        })}
      </div>
    </div>
  );
}
