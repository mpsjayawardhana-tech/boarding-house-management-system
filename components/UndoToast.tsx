"use client";

import { useAppStore } from "@/store";
import { RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

export function UndoToast() {
  const { pastStates, undoLastAction } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pastStates.length > 0) {
      setIsVisible(true);
      // Auto-hide the toast after 10 seconds of inactivity
      const timer = setTimeout(() => setIsVisible(false), 10000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [pastStates.length]); // Dependency on the array length

  if (!isVisible || pastStates.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 pr-12 shadow-2xl flex items-center gap-4 relative border border-slate-700">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Action Completed</h4>
          <p className="text-xs text-slate-400">You can undo this change.</p>
        </div>
        <button 
          onClick={() => { undoLastAction(); setIsVisible(false); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors ml-2"
        >
          Undo
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
